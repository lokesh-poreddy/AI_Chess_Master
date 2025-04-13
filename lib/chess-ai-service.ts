import type { Chess, Move } from "chess.js"

type ChessDataset = {
  openings: Record<string, { move: string; frequency: number }[]>
  middleGame: Record<string, { move: string; evaluation: number }[]>
  endGame: Record<string, { move: string; evaluation: number }[]>
}

let chessData: ChessDataset | null = null

// Function to load chess data from our API
export async function loadChessData(): Promise<ChessDataset> {
  if (chessData) return chessData

  try {
    const response = await fetch("/api/chess-data")
    chessData = await response.json()
    return chessData
  } catch (error) {
    console.error("Failed to load chess data:", error)
    // Return empty dataset as fallback
    return {
      openings: {},
      middleGame: {},
      endGame: {},
    }
  }
}

// Determine game phase based on piece count and move number
function determineGamePhase(game: Chess): "opening" | "middleGame" | "endGame" {
  const fen = game.fen()
  const moveNumber = game.moveNumber()
  const piecesCount = (fen.split(" ")[0].match(/[pnbrqkPNBRQK]/g) || []).length

  if (moveNumber <= 10 && piecesCount >= 28) return "opening"
  if (piecesCount >= 15) return "middleGame"
  return "endGame"
}

// Minimax algorithm with alpha-beta pruning
function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game)
  }

  if (isMaximizingPlayer) {
    let maxEval = Number.NEGATIVE_INFINITY
    const moves = game.moves({ verbose: true })

    for (const move of moves) {
      game.move(move)
      const evaluation = minimax(game, depth - 1, alpha, beta, false)
      game.undo()

      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break // Beta cutoff
    }

    return maxEval
  } else {
    let minEval = Number.POSITIVE_INFINITY
    const moves = game.moves({ verbose: true })

    for (const move of moves) {
      game.move(move)
      const evaluation = minimax(game, depth - 1, alpha, beta, true)
      game.undo()

      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break // Alpha cutoff
    }

    return minEval
  }
}

// Simple position evaluation function
function evaluatePosition(game: Chess): number {
  // If the game is over, return a high/low value
  if (game.isCheckmate()) return game.turn() === "w" ? -1000 : 1000
  if (game.isDraw()) return 0

  const fen = game.fen()
  const pieces = fen.split(" ")[0]

  // Piece values
  const pieceValues: Record<string, number> = {
    p: -1,
    n: -3,
    b: -3,
    r: -5,
    q: -9,
    k: -100,
    P: 1,
    N: 3,
    B: 3,
    R: 5,
    Q: 9,
    K: 100,
  }

  // Calculate material advantage
  let evaluation = 0
  for (const char of pieces) {
    if (pieceValues[char]) {
      evaluation += pieceValues[char]
    }
  }

  // Add a small random factor to avoid repetitive play
  evaluation += Math.random() * 0.2 - 0.1

  return evaluation
}

// Find best move using the dataset or minimax algorithm
export async function findBestMove(game: Chess, difficulty: "easy" | "medium" | "hard"): Promise<Move | null> {
  // Load chess data if not already loaded
  const data = await loadChessData()

  // Get all legal moves
  const legalMoves = game.moves({ verbose: true })
  if (legalMoves.length === 0) return null

  // Determine the current game phase
  const phase = determineGamePhase(game)

  // Try to find the position in our dataset
  const fen = game.fen()
  const simplifiedFen = fen.split(" ").slice(0, 4).join(" ") // Simplify FEN for better matching

  // Different strategies based on difficulty
  if (difficulty === "easy") {
    // Easy: 70% random moves, 30% from dataset or simple evaluation
    if (Math.random() < 0.7) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)]
    }

    // For the remaining 30%, try to use the dataset
    if (phase === "opening" && data.openings[simplifiedFen]) {
      const moves = data.openings[simplifiedFen]
      const move = selectMoveByFrequency(moves)
      const matchingLegalMove = legalMoves.find((m) => `${m.from}${m.to}` === move)
      if (matchingLegalMove) return matchingLegalMove
    }

    // If no dataset move, use simple evaluation
    return findMoveBySimpleEvaluation(game, legalMoves, 1)
  } else if (difficulty === "medium") {
    // Medium: 50% dataset/simple evaluation, 50% minimax with depth 2
    if (Math.random() < 0.5) {
      // Try to use the dataset first
      if (phase === "opening" && data.openings[simplifiedFen]) {
        const moves = data.openings[simplifiedFen]
        const move = selectMoveByFrequency(moves)
        const matchingLegalMove = legalMoves.find((m) => `${m.from}${m.to}` === move)
        if (matchingLegalMove) return matchingLegalMove
      }

      // If no dataset move, use simple evaluation
      return findMoveBySimpleEvaluation(game, legalMoves, 2)
    } else {
      // Use minimax with depth 2
      return findMoveWithMinimax(game, 2)
    }
  } else {
    // Hard: Always use the best strategy available
    // First try dataset for openings
    if (phase === "opening" && data.openings[simplifiedFen]) {
      const moves = data.openings[simplifiedFen]
      const move = selectMoveByFrequency(moves)
      const matchingLegalMove = legalMoves.find((m) => `${m.from}${m.to}` === move)
      if (matchingLegalMove) return matchingLegalMove
    }

    // For middle and end game, use minimax with appropriate depth
    const depth = phase === "endGame" ? 4 : 3
    return findMoveWithMinimax(game, depth)
  }
}

// Helper function to select a move based on frequency
function selectMoveByFrequency(moves: { move: string; frequency: number }[]): string {
  const totalFrequency = moves.reduce((sum, move) => sum + move.frequency, 0)
  let random = Math.random() * totalFrequency

  for (const move of moves) {
    random -= move.frequency
    if (random <= 0) return move.move
  }

  return moves[0].move // Fallback to first move
}

// Find move using simple evaluation
function findMoveBySimpleEvaluation(game: Chess, legalMoves: Move[], randomFactor: number): Move {
  const evaluations = legalMoves.map((move) => {
    game.move(move)
    const evaluation = evaluatePosition(game) + Math.random() * randomFactor
    game.undo()
    return { move, evaluation }
  })

  // Sort by evaluation (highest first for white, lowest first for black)
  evaluations.sort((a, b) => (game.turn() === "w" ? b.evaluation - a.evaluation : a.evaluation - b.evaluation))

  return evaluations[0].move
}

// Find move using minimax algorithm
function findMoveWithMinimax(game: Chess, depth: number): Move {
  const legalMoves = game.moves({ verbose: true })
  const isMaximizingPlayer = game.turn() === "w"

  const evaluations = legalMoves.map((move) => {
    game.move(move)
    const evaluation = minimax(game, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !isMaximizingPlayer)
    game.undo()
    return { move, evaluation }
  })

  // Sort by evaluation (highest first for white, lowest first for black)
  evaluations.sort((a, b) => (isMaximizingPlayer ? b.evaluation - a.evaluation : a.evaluation - b.evaluation))

  return evaluations[0].move
}
