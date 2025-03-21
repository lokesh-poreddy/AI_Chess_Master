import React, { useState } from 'react';
import ChessGame from './components/ChessGame';
import type { Difficulty } from './types';
import { ChevronRight as ChessKnight } from 'lucide-react';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [key, setKey] = useState(0);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleRestart = () => {
    setKey(prev => prev + 1);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ChessKnight className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Chess Master</h1>
            <p className="text-gray-600">Challenge yourself against our AI opponent</p>
          </div>

          {!gameStarted ? (
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Difficulty</h2>
              <div className="space-y-4">
                {(['easy', 'intermediate', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`w-full py-3 px-6 rounded-lg text-lg font-medium transition-colors
                      ${difficulty === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
                <button
                  onClick={handleStartGame}
                  className="w-full py-3 px-6 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors mt-6"
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : (
            <ChessGame
              key={key}
              difficulty={difficulty}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;