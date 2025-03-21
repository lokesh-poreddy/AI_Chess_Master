import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { Difficulty } from '../types';
import { Trophy, RotateCcw } from 'lucide-react';

interface ChessGameProps {
  difficulty: Difficulty;
  onRestart: () => void;
}

const difficultyDepth = {
  easy: 1,
  intermediate: 2,
  hard: 3,
};

// Famous chess openings by difficulty using standard algebraic notation (SAN)
const openingMoves = {
  easy: [
    { name: "King's Pawn", moves: ['e4', 'e5'] },
    { name: "Queen's Pawn", moves: ['d4', 'd5'] },
    { name: "English Opening", moves: ['c4'] }
  ],
  intermediate: [
    { name: "Ruy Lopez", moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
    { name: "Sicilian Defense", moves: ['e4', 'c5'] },
    { name: "French Defense", moves: ['e4', 'e6'] }
  ],
  hard: [
    { name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'] },
    { name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'] },
    { name: "Caro-Kann Defense", moves: ['e4', 'c6'] }
  ]
};

// Endgame patterns by difficulty
const endgamePatterns = {
  easy: [
    { pattern: 'rook_king_mate', pieces: ['k', 'r', 'K'] },
    { pattern: 'queen_mate', pieces: ['k', 'q', 'K'] }
  ],
  intermediate: [
    { pattern: 'two_bishops_mate', pieces: ['k', 'b', 'b', 'K'] },
    { pattern: 'rook_bishop_mate', pieces: ['k', 'r', 'b', 'K'] }
  ],
  hard: [
    { pattern: 'queen_knight_mate', pieces: ['k', 'q', 'n', 'K'] },
    { pattern: 'rook_knight_mate', pieces: ['k', 'r', 'n', 'K'] }
  ]
};

const ChessGame: React.FC<ChessGameProps> = ({ difficulty, onRestart }) => {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedOpening, setSelectedOpening] = useState<string[]>([]);

  // Initialize game with selected opening
  useEffect(() => {
    const openings = openingMoves[difficulty];
    const randomOpening = openings[Math.floor(Math.random() * openings.length)];
    setSelectedOpening(randomOpening.moves);
  }, [difficulty]);

  const isEndgame = (position: Chess): boolean => {
    const pieces = position.board().flat().filter(piece => piece !== null);
    return pieces.length <= 10; // Consider it endgame when 10 or fewer pieces remain
  };

  const getEndgameBonus = (position: Chess, moveObj: { san: string }): number => {
    if (!isEndgame(position)) return 0;

    const patterns = endgamePatterns[difficulty];
    let bonus = 0;

    // Check if move leads to a known winning pattern
    patterns.forEach(pattern => {
      const tempGame = new Chess(position.fen());
      try {
        tempGame.move(moveObj.san);
        
        // Calculate bonus based on piece positioning and control of key squares
        if (pattern.pattern.includes('mate')) {
          if (tempGame.isCheckmate()) bonus += 500;
          else if (tempGame.isCheck()) bonus += 200;
        }
        
        // Bonus for controlling center in endgame
        const centralSquares = ['d4', 'd5', 'e4', 'e5'];
        centralSquares.forEach(square => {
          const piece = tempGame.get(square);
          if (piece && piece.color === 'b') bonus += 50;
        });
      } catch (e) {
        // Invalid move, skip this pattern
      }
    });

    return bonus;
  };

  const makeAIMove = useCallback(() => {
    const possibleMoves = game.moves({ verbose: true });
    
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
      setGameOver(true);
      return;
    }

    // Use opening book in early game
    if (moveCount < selectedOpening.length) {
      try {
        const openingMove = selectedOpening[moveCount];
        const move = game.move(openingMove);
        if (move) {
          setGame(new Chess(game.fen()));
          setMoveCount(prev => prev + 1);
          return;
        }
      } catch (e) {
        // If opening move fails, continue with regular AI move
      }
    }

    // Use minimax with alpha-beta pruning for middle and endgame
    const depth = difficultyDepth[difficulty];
    let bestMove = null;
    let bestValue = -9999;

    for (const move of possibleMoves) {
      game.move(move);
      const value = minimax(game, depth - 1, false, -10000, 10000) + 
                   getEndgameBonus(game, move);
      game.undo();

      if (value >= bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    if (bestMove) {
      game.move(bestMove);
      setGame(new Chess(game.fen()));
      setMoveCount(prev => prev + 1);
    }
  }, [game, difficulty, moveCount, selectedOpening]);

  const minimax = (position: Chess, depth: number, maximizingPlayer: boolean, alpha: number, beta: number): number => {
    if (depth === 0) {
      return evaluateBoard(position);
    }

    const possibleMoves = position.moves();

    if (maximizingPlayer) {
      let maxEval = -9999;
      for (const move of possibleMoves) {
        position.move(move);
        const evaluation = minimax(position, depth - 1, false, alpha, beta);
        position.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = 9999;
      for (const move of possibleMoves) {
        position.move(move);
        const evaluation = minimax(position, depth - 1, true, alpha, beta);
        position.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const evaluateBoard = (position: Chess): number => {
    let total = 0;
    const pieceValues = {
      p: 100,
      n: 320,
      b: 330,
      r: 500,
      q: 900,
      k: 20000,
    };

    // Piece-square tables for positional evaluation
    const pawnPositionBonus = [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ];

    // Evaluate material and position
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = position.get(String.fromCharCode(97 + i) + (j + 1));
        if (piece) {
          // Base piece value
          let value = pieceValues[piece.type as keyof typeof pieceValues];
          
          // Add positional bonus for pawns
          if (piece.type === 'p') {
            value += pawnPositionBonus[piece.color === 'w' ? 7 - j : j][i];
          }

          // Multiply by color (-1 for black, 1 for white)
          total += value * (piece.color === 'w' ? 1 : -1);
        }
      }
    }

    // Additional strategic evaluations
    if (position.isCheck()) total += 50;
    if (position.isCheckmate()) total += 10000;
    if (position.isDraw()) total += 0;

    return total;
  };

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;

      setGame(new Chess(game.fen()));
      setMoveCount(prev => prev + 1);
      setTimeout(makeAIMove, 300);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (game.isGameOver()) {
      setGameOver(true);
    }
  }, [game]);

  return (
    <div className="w-full max-w-[600px]">
      <div className="bg-white rounded-lg shadow-xl p-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-700">
            {gameOver ? (
              <div className="flex items-center text-yellow-600">
                <Trophy className="w-6 h-6 mr-2" />
                Game Over!
              </div>
            ) : (
              `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
            )}
          </div>
          <button
            onClick={onRestart}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </button>
        </div>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={560}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
        <div className="mt-4 text-sm text-gray-600">
          {game.isCheck() ? "Check!" : ""}
          {game.isCheckmate() ? "Checkmate!" : ""}
          {game.isDraw() ? "Draw!" : ""}
        </div>
      </div>
    </div>
  );
};

export default ChessGame;