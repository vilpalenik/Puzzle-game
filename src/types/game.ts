export interface Position {
  x: number;
  y: number;
}

export type PieceType = 
  | 'large-triangle' 
  | 'medium-triangle' 
  | 'small-triangle' 
  | 'square' 
  | 'parallelogram';

export interface TangramPiece {
  id: string;
  type: PieceType;
  position: Position;
  rotation: number;
  color: string;
}

export interface TargetShape {
  width: number;
  height: number;
  pieces: TangramPiece[];
}

export interface Level {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetShape: TargetShape;
}

export interface LevelsData {
  levels: Level[];
}

export interface LevelStats {
  bestTime: number | null;
  attempts: number;
}

export interface GameState {
  currentLevel: number;
  pieces: TangramPiece[];
  completedLevels: number[];
  isCompleted: boolean;
  // Nové pole pre štatistiky: kľúčom je ID levelu
  stats: Record<number, LevelStats>;
}



