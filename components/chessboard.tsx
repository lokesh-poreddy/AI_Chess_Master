"use client"

import { useState, useEffect } from "react"
import { Chessboard as ReactChessboard } from "react-chessboard"

interface ChessboardProps {
  position: string
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean
  boardOrientation: "white" | "black"
  boardWidth?: number
}

export default function Chessboard({ position, onPieceDrop, boardOrientation = "white", boardWidth }: ChessboardProps) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1000,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate responsive board width
  const calculateBoardWidth = () => {
    if (boardWidth) return boardWidth

    const containerWidth = windowSize.width

    if (containerWidth >= 1280) {
      return Math.min(700, containerWidth * 0.5) // lg screens
    } else if (containerWidth >= 768) {
      return Math.min(600, containerWidth * 0.7) // md screens
    } else {
      return Math.min(400, containerWidth * 0.9) // sm screens
    }
  }

  return (
    <div className="mx-auto">
      <ReactChessboard
        position={position}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        boardWidth={calculateBoardWidth()}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
        customDarkSquareStyle={{ backgroundColor: "#779952" }}
        customLightSquareStyle={{ backgroundColor: "#edeed1" }}
      />
    </div>
  )
}
