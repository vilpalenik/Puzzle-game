import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Level, LevelsData } from '../types/game';
import levelsDataRaw from '../data/levels.json';

const levelsData = levelsDataRaw as LevelsData;

interface GameContextType {
  gameState: GameState;
  currentLevel: Level | null;
  updatePiecePosition: (id: string, position: { x: number; y: number }) => void;
  rotatePiece: (id: string) => void;
  checkCompletion: () => boolean;
  resetLevel: () => void;
  loadLevel: (levelId: number) => void;
  showHint: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame musí byť použité v GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('tangram-progress');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentLevel: 1,
      pieces: [],
      completedLevels: [],
      isCompleted: false,
    };
  });

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  useEffect(() => {
    localStorage.setItem('tangram-progress', JSON.stringify(gameState));
  }, [gameState]);

  const loadLevel = (levelId: number) => {
    const level = levelsData.levels.find(l => l.id === levelId);
    if (level) {
        setCurrentLevel(level);
        
        // UPRAVENÉ POZÍCIE - bližšie k stredu
        const positions = [
        { x: 80, y: 100 },      // Ľavá strana hore
        { x: 80, y: 250 },      // Ľavá strana stred
        { x: 80, y: 400 },      // Ľavá strana dole
        { x: 780, y: 100 },     // Pravá strana hore
        { x: 780, y: 250 },     // Pravá strana stred
        { x: 780, y: 400 },     // Pravá strana dole
        { x: 330, y: 530 },     // Dole v strede
        ];

        const initialPieces = level.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: positions[index] || { x: 100 + index * 80, y: 500 },
        rotation: Math.floor(Math.random() * 8) * 45,
        }));
        
        setGameState(prev => ({ 
        ...prev, 
        currentLevel: levelId,
        pieces: initialPieces, 
        isCompleted: false 
        }));
    }
    };

  const updatePiecePosition = (id: string, position: { x: number; y: number }) => {
    setGameState(prev => ({
      ...prev,
      pieces: prev.pieces.map(piece =>
        piece.id === id ? { ...piece, position } : piece
      ),
    }));
  };

  const rotatePiece = (id: string) => {
    setGameState(prev => ({
      ...prev,
      pieces: prev.pieces.map(piece =>
        piece.id === id ? { ...piece, rotation: (piece.rotation + 45) % 360 } : piece
      ),
    }));
  };

  const showHint = () => {
    if (!currentLevel) return;

    // Nájdi kúsky ktoré ešte nie sú správne umiestnené
    const incorrectPieces = gameState.pieces.filter(userPiece => {
      const targetPiece = currentLevel.targetShape.pieces.find(p => p.id === userPiece.id);
      if (!targetPiece) return false;

      const boardCenterX = 500;
      const boardCenterY = 325;
      const targetX = boardCenterX + (targetPiece.position.x - 250);
      const targetY = boardCenterY + (targetPiece.position.y - 250);

      const isCorrectPosition = 
        Math.abs(userPiece.position.x - targetX) < 30 &&
        Math.abs(userPiece.position.y - targetY) < 30;

      const normalizeRot = (rot: number) => ((rot % 360) + 360) % 360;
      const isCorrectRotation = 
        Math.abs(normalizeRot(userPiece.rotation) - normalizeRot(targetPiece.rotation)) < 15;

      return !(isCorrectPosition && isCorrectRotation);
    });

    if (incorrectPieces.length === 0) return;

    // Vyber náhodný nesprávny kúsok
    const randomPiece = incorrectPieces[Math.floor(Math.random() * incorrectPieces.length)];
    const targetPiece = currentLevel.targetShape.pieces.find(p => p.id === randomPiece.id);
    
    if (targetPiece) {
      const boardCenterX = 500;
      const boardCenterY = 325;
      const correctX = boardCenterX + (targetPiece.position.x - 250);
      const correctY = boardCenterY + (targetPiece.position.y - 250);

      setGameState(prev => ({
        ...prev,
        pieces: prev.pieces.map(piece =>
          piece.id === randomPiece.id
            ? { ...piece, position: { x: correctX, y: correctY }, rotation: targetPiece.rotation }
            : piece
        ),
      }));
    }
  };

  const checkCompletion = (): boolean => {
    if (!currentLevel) return false;

    const POSITION_TOLERANCE = 30;
    const ROTATION_TOLERANCE = 15;

    const allPiecesCorrect = gameState.pieces.every(userPiece => {
      const targetPiece = currentLevel.targetShape.pieces.find(p => p.id === userPiece.id);
      if (!targetPiece) return false;

      const boardCenterX = 500;
      const boardCenterY = 325;
      
      const targetX = boardCenterX + (targetPiece.position.x - 250);
      const targetY = boardCenterY + (targetPiece.position.y - 250);

      const positionMatch =
        Math.abs(userPiece.position.x - targetX) < POSITION_TOLERANCE &&
        Math.abs(userPiece.position.y - targetY) < POSITION_TOLERANCE;

      const normalizeRotation = (rot: number) => ((rot % 360) + 360) % 360;
      const userRot = normalizeRotation(userPiece.rotation);
      const targetRot = normalizeRotation(targetPiece.rotation);
      
      const rotationMatch = Math.abs(userRot - targetRot) < ROTATION_TOLERANCE ||
                           Math.abs(userRot - targetRot) > (360 - ROTATION_TOLERANCE);

      return positionMatch && rotationMatch;
    });

    if (allPiecesCorrect && !gameState.isCompleted) {
      setGameState(prev => ({
        ...prev,
        isCompleted: true,
        completedLevels: [...new Set([...prev.completedLevels, prev.currentLevel])],
      }));
    }

    return allPiecesCorrect;
  };

  const resetLevel = () => {
    if (currentLevel) {
        const positions = [
          { x: 80, y: 100 },      // Ľavá strana hore
          { x: 80, y: 250 },      // Ľavá strana stred
          { x: 80, y: 400 },      // Ľavá strana dole
          { x: 780, y: 100 },     // Pravá strana hore
          { x: 780, y: 250 },     // Pravá strana stred
          { x: 780, y: 400 },     // Pravá strana dole
          { x: 330, y: 530 },     // Dole v strede
        ];

        const initialPieces = currentLevel.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: positions[index] || { x: 100 + index * 80, y: 500 },
        rotation: Math.floor(Math.random() * 8) * 45,
        }));
        
        setGameState(prev => ({
        ...prev,
        pieces: initialPieces,
        isCompleted: false,
        }));
    }
    };

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentLevel,
        updatePiecePosition,
        rotatePiece,
        checkCompletion,
        resetLevel,
        loadLevel,
        showHint,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};