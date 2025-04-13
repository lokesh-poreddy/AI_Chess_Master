import { NextResponse } from "next/server"

// This will store our processed chess data
let processedData: {
  openings: Record<string, { move: string; frequency: number }[]>
  middleGame: Record<string, { move: string; evaluation: number }[]>
  endGame: Record<string, { move: string; evaluation: number }[]>
} | null = null

// Function to determine game phase based on piece count
function determineGamePhase(fen: string): "opening" | "middleGame" | "endGame" {
  const piecesCount = (fen.split(" ")[0].match(/[pnbrqkPNBRQK]/g) || []).length

  if (piecesCount >= 28) return "opening" // Most pieces still on board
  if (piecesCount >= 15) return "middleGame" // Some pieces captured
  return "endGame" // Few pieces left
}

export async function GET() {
  try {
    // If we've already processed the data, return it
    if (processedData) {
      return NextResponse.json(processedData)
    }

    // In a real implementation, we would fetch from Hugging Face
    // For now, we'll use a simplified version with common chess patterns

    // Sample data structure (this would normally come from the dataset)
    processedData = {
      openings: {
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
          { move: "e2e4", frequency: 0.44 }, // e4
          { move: "d2d4", frequency: 0.38 }, // d4
          { move: "c2c4", frequency: 0.12 }, // c4
          { move: "g1f3", frequency: 0.06 }, // Nf3
        ],
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": [
          { move: "c7c5", frequency: 0.35 }, // c5 (Sicilian)
          { move: "e7e5", frequency: 0.3 }, // e5
          { move: "e7e6", frequency: 0.2 }, // e6 (French)
          { move: "c7c6", frequency: 0.15 }, // c6 (Caro-Kann)
        ],
        // More opening positions would be here
      },
      middleGame: {
        // Sample middle game positions with evaluations
        "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4": [
          { move: "d2d4", evaluation: 0.35 },
          { move: "c2c3", evaluation: 0.25 },
          { move: "e1g1", evaluation: 0.45 }, // Castle
        ],
      },
      endGame: {
        // Sample endgame positions with evaluations
        "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1": [
          { move: "e2e4", evaluation: 0.7 },
          { move: "e1d2", evaluation: 0.2 },
        ],
      },
    }

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error loading chess data:", error)
    return NextResponse.json({ error: "Failed to load chess data" }, { status: 500 })
  }
}
