"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Chess } from "chess.js"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RotateCcw, Trophy, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { findBestMove, loadChessData } from "@/lib/chess-ai-service"

// Dynamically import the chessboard to avoid SSR issues
const Chessboard = dynamic(() => import("@/components/chessboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function ChessGame() {
  const [game, setGame] = useState<Chess>(new Chess())
  const [fen, setFen] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [orientation, setOrientation] = useState("white")
  const [gameStatus, setGameStatus] = useState("")
  const [thinking, setThinking] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Initialize the game and load chess data
  useEffect(() => {
    const newGame = new Chess()
    setGame(newGame)
    setFen(newGame.fen())
    setGameStatus("")
    setMoveHistory([])

    // Load chess data
    loadChessData()
      .then(() => {
        setDataLoaded(true)
      })
      .catch((error) => {
        console.error("Failed to load chess data:", error)
        setDataLoaded(true) // Set to true anyway to allow gameplay
      })
  }, [])

  // Check game status after each move
  useEffect(() => {
    if (game) {
      updateGameStatus()
    }
  }, [fen, game])

  const updateGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`)
    } else if (game.isDraw()) {
      setGameStatus("Draw!")
    } else if (game.isStalemate()) {
      setGameStatus("Stalemate!")
    } else if (game.isThreefoldRepetition()) {
      setGameStatus("Draw by repetition!")
    } else if (game.isInsufficientMaterial()) {
      setGameStatus("Draw by insufficient material!")
    } else if (game.isCheck()) {
      setGameStatus(`${game.turn() === "w" ? "White" : "Black"} is in check!`)
    } else {
      setGameStatus(`${game.turn() === "w" ? "White" : "Black"} to move`)
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      // Try to make the move
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      })

      // If the move is invalid, return false
      if (!move) return false

      // Update the board
      setFen(game.fen())

      // Add move to history
      setMoveHistory((prev) => [...prev, `${move.color === "w" ? "White" : "Black"}: ${move.san}`])

      // Make AI move if the game is not over
      if (!game.isGameOver()) {
        makeAIMove()
      }

      return true
    } catch (error) {
      return false
    }
  }

  const makeAIMove = async () => {
    setThinking(true)

    // Simulate AI thinking time
    setTimeout(
      async () => {
        if (game.isGameOver()) {
          setThinking(false)
          return
        }

        try {
          // Use our AI service to find the best move
          const move = await findBestMove(game, difficulty as "easy" | "medium" | "hard")

          if (move) {
            game.move(move)
            setFen(game.fen())

            // Add move to history
            setMoveHistory((prev) => [...prev, `${move.color === "w" ? "White" : "Black"}: ${move.san}`])
          }
        } catch (error) {
          console.error("Error making AI move:", error)
        } finally {
          setThinking(false)
        }
      },
      difficulty === "easy" ? 500 : difficulty === "medium" ? 1000 : 1500,
    ) // Thinking time based on difficulty
  }

  const resetGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setFen(newGame.fen())
    setGameStatus("")
    setMoveHistory([])
  }

  const changeDifficulty = (value: string) => {
    setDifficulty(value)
    resetGame()
  }

  const flipBoard = () => {
    setOrientation(orientation === "white" ? "black" : "white")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">AI Chess Master</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Select value={difficulty} onValueChange={changeDifficulty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={flipBoard}>
                Flip Board
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {thinking && (
                <Badge variant="outline" className="animate-pulse">
                  <Brain className="mr-1 h-3 w-3" /> AI is thinking...
                </Badge>
              )}

              <Badge
                variant={gameStatus.includes("wins") ? "default" : "outline"}
                className={cn(
                  gameStatus.includes("check") && !gameStatus.includes("mate") && "bg-amber-500",
                  gameStatus.includes("wins") && "bg-green-500",
                )}
              >
                {gameStatus}
              </Badge>

              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New Game
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            {!dataLoaded ? (
              <div className="flex h-[500px] w-full flex-col items-center justify-center">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <p>Loading chess data...</p>
              </div>
            ) : (
              <Chessboard position={fen} onPieceDrop={onDrop} boardOrientation={orientation} boardWidth={undefined} />
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Move History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] overflow-y-auto">
                {moveHistory.length > 0 ? (
                  <ul className="space-y-1">
                    {moveHistory.map((move, index) => (
                      <li key={index} className="text-sm">
                        {Math.floor(index / 2) + 1}. {move}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground">No moves yet. Start the game!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
