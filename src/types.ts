export type Difficulty = 'easy' | 'intermediate' | 'hard';

export interface GameState {
  fen: string;
  difficulty: Difficulty;
  isGameOver: boolean;
  status: string;
}