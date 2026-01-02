import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Level, LevelsData, PieceType } from '../types/game';
import levelsDataRaw from '../data/levels.json';

const levelsData = levelsDataRaw as LevelsData;

// symetrie utvarov
const PIECE_SYMMETRY: Record<PieceType, number> = {
  'large-triangle': 360,
  'medium-triangle': 360,
  'small-triangle': 360,
  'square': 90,
  'parallelogram': 180,
};

interface GameContextType {
  gameState: GameState;
  currentLevel: Level | null;
  currentTime: number;
  updatePiecePosition: (id: string, position: { x: number; y: number }) => void;
  rotatePiece: (id: string) => void;
  checkCompletion: () => boolean;
  resetLevel: () => void;
  loadLevel: (levelId: number) => void;
  showHint: () => void;
  getUnlockedDifficulties: () => string[]; // NOVÁ FUNKCIA
  isLevelUnlocked: (levelId: number) => boolean; // NOVÁ FUNKCIA
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
      stats: {},
    };
  });

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  useEffect(() => {
    localStorage.setItem('tangram-progress', JSON.stringify(gameState));
  }, [gameState]);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  // casovac hry
  useEffect(() => {
    let interval: any;
    if (isActive && !gameState.isCompleted) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, gameState.isCompleted]);

  const getUnlockedDifficulties = (): string[] => {
    const easyLevels = levelsData.levels.filter(l => l.difficulty === 'Easy');
    const mediumLevels = levelsData.levels.filter(l => l.difficulty === 'Medium');
    const hardLevels = levelsData.levels.filter(l => l.difficulty === 'Hard');
    
    const completedEasy = easyLevels.filter(l => 
      gameState.completedLevels.includes(l.id)
    ).length;
    
    const completedMedium = mediumLevels.filter(l => 
      gameState.completedLevels.includes(l.id)
    ).length;
    
    const completedHard = hardLevels.filter(l => 
      gameState.completedLevels.includes(l.id)
    ).length;
    
    const unlocked = ['Easy']; // easy je vzdy odomknuta
    
    // ak su easy dokoncene, odomkni Medium
    if (completedEasy === easyLevels.length) {
      unlocked.push('Medium');
    }
    
    // ak su medium dokoncene, odomkni Hard
    if (completedMedium === mediumLevels.length) {
      unlocked.push('Hard');
    }
    
    // ak su vsetky Hard dokoncene, odomkni vsetky obtiaznosti
    if (completedHard === hardLevels.length) {
      return ['Easy', 'Medium', 'Hard', 'All'];
    }
    
    return unlocked;
  };

  // kontrola ci je level odomknuty
  const isLevelUnlocked = (levelId: number): boolean => {
    const level = levelsData.levels.find(l => l.id === levelId);
    if (!level) return false;
    
    const unlockedDifficulties = getUnlockedDifficulties();
    
    // ak je odomknuta vsetka obtiaznost, vrat true
    if (unlockedDifficulties.includes('All')) {
      return true;
    }
    
    // inak skontroluj obtiaznost levelu
    return unlockedDifficulties.includes(level.difficulty);
  };

  const loadLevel = (levelId: number) => {
    const level = levelsData.levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevel(level);
      setCurrentTime(0);
      setIsActive(true);

      // nacitanie stats
      const currentStats = (gameState.stats && gameState.stats[levelId]) 
        ? gameState.stats[levelId] 
        : { bestTime: null, attempts: 0 };
      
      // pozicie utvarov
      const basePositions = [
        // lava strana
        { x: 80, y: 80 },
        { x: 80, y: 200 },
        { x: 80, y: 320 },
        { x: 80, y: 440 },
        
        // prava strana
        { x: 780, y: 80 },
        { x: 780, y: 200 },
        { x: 780, y: 320 },
        { x: 780, y: 440 },
        
        // spodok 
        { x: 200, y: 550 },
        { x: 320, y: 550 },
        { x: 440, y: 550 },
        { x: 560, y: 550 },
        { x: 680, y: 550 },
        
        // zaloha
        { x: 400, y: 80 },
        { x: 400, y: 200 },
      ];

      const initialPieces = level.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: basePositions[index] || { x: 100 + (index * 80) % 800, y: 500 },
        rotation: 0,
      }));
      
      setGameState(prev => ({ 
        ...prev, 
        currentLevel: levelId,
        pieces: initialPieces, 
        isCompleted: false,
        stats: {
          ...prev.stats,
          [levelId]: { 
            ...currentStats, 
            attempts: currentStats.attempts + 1
          }
        } 
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

  const isDiagonalRotation = (rotation: number): boolean => {
    const normalized = ((rotation % 360) + 360) % 360;
    const mod = normalized % 90;
    return Math.abs(mod - 45) < 1;
  };

  const getPositionForRotation = (
    basePosition: { x: number; y: number },
    baseRotation: number,
    actualRotation: number,
    pieceType: PieceType
  ): { x: number; y: number } => {
    const normalizeRot = (rot: number) => ((rot % 360) + 360) % 360;
    
    const base = normalizeRot(baseRotation);
    const actual = normalizeRot(actualRotation);
    
    const baseDiagonal = isDiagonalRotation(base);
    const actualDiagonal = isDiagonalRotation(actual);
    
    let offsetX = 0;
    let offsetY = 0;
    
    if (pieceType === 'square') {
      const halfDiagonal = 75 * Math.sqrt(2) / 2;
      
      if (baseDiagonal && actualDiagonal) {
        const diff = normalizeRot(actual - base);
        if (Math.abs(diff - 90) < 1) {
          offsetX = halfDiagonal;
          offsetY = halfDiagonal;
        } else if (Math.abs(diff - 180) < 1) {
          offsetX = 0;
          offsetY = 2 * halfDiagonal;
        } else if (Math.abs(diff - 270) < 1) {
          offsetX = -halfDiagonal;
          offsetY = halfDiagonal;
        }
      } else if (!baseDiagonal && !actualDiagonal) {
        const diff = normalizeRot(actual - base);
        if (Math.abs(diff - 90) < 1) {
          offsetX = 75;
          offsetY = 0;
        } else if (Math.abs(diff - 180) < 1) {
          offsetX = 75;
          offsetY = 75;
        } else if (Math.abs(diff - 270) < 1) {
          offsetX = 0;
          offsetY = 75;
        }
      } else if (!baseDiagonal && actualDiagonal) {
        offsetX = halfDiagonal;
        offsetY = halfDiagonal;
      } else {
        offsetX = -halfDiagonal;
        offsetY = -halfDiagonal;
      }
    }
    
    if (pieceType === 'parallelogram') {
      const diff = normalizeRot(actual - base);
      
      // 1: v JSON je 0, kosostvorec ma 180
      if (Math.abs(base - 0) < 1 && Math.abs(actual - 180) < 1) {
        offsetX = 159.099;
        offsetY = 53.033;
      }
      // 1 opacne
      else if (Math.abs(base - 180) < 1 && Math.abs(actual - 0) < 1) {
        offsetX = -159.099;
        offsetY = -53.033;
      }
      // 2: v JSON je 45, kosostvorec ma 225
      else if (Math.abs(base - 45) < 1 && Math.abs(actual - 225) < 1) {
        offsetX = 75;
        offsetY = 150;
      }
      // 2 opacne
      else if (Math.abs(base - 225) < 1 && Math.abs(actual - 45) < 1) {
        offsetX = -150;
        offsetY = -150;
      }
      // 3: v JSON je 90, kosostvorec ma 270
      else if (Math.abs(base - 90) < 1 && Math.abs(actual - 270) < 1) {
        offsetX = -53.033;
        offsetY = 159.099;
      }
      // 3 opacne
      else if (Math.abs(base - 270) < 1 && Math.abs(actual - 90) < 1) {
        offsetX = 53.033;
        offsetY = -159.099;
      }
      // 4: v JSON je 135, kosostvorec ma 315
      else if (Math.abs(base - 135) < 1 && Math.abs(actual - 315) < 1) {
        offsetX = -150;
        offsetY = 75;
      }
      // 4 opacne
      else if (Math.abs(base - 315) < 1 && Math.abs(actual - 135) < 1) {
        offsetX = 150;
        offsetY = -75;
      }
      else if (Math.abs(diff - 180) < 1) {
        offsetX = 160;
        offsetY = 54;
      }
    }
    
    return {
      x: basePosition.x + offsetX,
      y: basePosition.y + offsetY
    };
  };

  const piecesMatch = (
    userPiece: { id: string; type: PieceType; position: { x: number; y: number }; rotation: number; color: string },
    targetPiece: { id: string; type: PieceType; position: { x: number; y: number }; rotation: number; color: string },
    boardCenterX: number,
    boardCenterY: number,
    positionTolerance: number,
    targetOffsetX: number,
    targetOffsetY: number
  ): boolean => {
    const normalizeRotation = (rot: number) => ((rot % 360) + 360) % 360;
    
    const userNorm = normalizeRotation(userPiece.rotation);
    const targetNorm = normalizeRotation(targetPiece.rotation);
    
    // kontrola pre kosostvorec
    if (userPiece.type === 'parallelogram') {
      // presny match rotacie alebo 180° rozdiel
      const diff = Math.abs(userNorm - targetNorm);
      const altDiff = 360 - diff;
      const minDiff = Math.min(diff, altDiff);
      
      // presna zhodnost alebo zhodnost po otoceni o 180°
      if (minDiff < 1 || Math.abs(minDiff - 180) < 1) {
        const baseTargetPos = {
          x: boardCenterX + (targetPiece.position.x - targetOffsetX),
          y: boardCenterY + (targetPiece.position.y - targetOffsetY)
        };
        
        const expectedPos = getPositionForRotation(
          baseTargetPos,
          targetPiece.rotation,
          userPiece.rotation,
          userPiece.type
        );
        
        const positionMatch =
          Math.abs(userPiece.position.x - expectedPos.x) < positionTolerance &&
          Math.abs(userPiece.position.y - expectedPos.y) < positionTolerance;
        
        if (positionMatch) {
          console.log(`Parallelogram match! Target: ${targetNorm}°, User: ${userNorm}°, Diff: ${minDiff}°`);
          return true;
        }
      }
      
      return false;
    }
    
    // ostatne tvary
    const symmetry = PIECE_SYMMETRY[userPiece.type];
    const diff = Math.abs(userNorm - targetNorm);
    const altDiff = 360 - diff;
    const minDiff = Math.min(diff, altDiff);
    
    for (let i = 0; i * symmetry <= 360; i++) {
      const symmetricAngle = i * symmetry;
      if (Math.abs(minDiff - symmetricAngle) < 1) {
        const baseTargetPos = {
          x: boardCenterX + (targetPiece.position.x - targetOffsetX),
          y: boardCenterY + (targetPiece.position.y - targetOffsetY)
        };
        
        const expectedPos = getPositionForRotation(
          baseTargetPos,
          targetPiece.rotation,
          userPiece.rotation,
          userPiece.type
        );
        
        const positionMatch =
          Math.abs(userPiece.position.x - expectedPos.x) < positionTolerance &&
          Math.abs(userPiece.position.y - expectedPos.y) < positionTolerance;
        
        if (positionMatch) return true;
      }
    }
    
    return false;
  };

  const showHint = () => {
    if (!currentLevel) return;

    // penalizacia 30 sekund
    setCurrentTime(prev => prev + 30);

    const boardCenterX = 500;
    const boardCenterY = 325;
    const POSITION_TOLERANCE = 10;

    // velkost siluety pre dynamicky offset
    const targetWidth = currentLevel.targetShape.width;
    const targetHeight = currentLevel.targetShape.height;
    const offsetX = targetWidth / 2;
    const offsetY = targetHeight / 2;

    const occupiedTargets = new Set<number>();
    const correctUserPieces = new Set<string>();
    
    gameState.pieces.forEach(userPiece => {
      currentLevel.targetShape.pieces.forEach((targetPiece, targetIndex) => {
        if (targetPiece.type !== userPiece.type) return;
        
        if (piecesMatch(userPiece, targetPiece, boardCenterX, boardCenterY, POSITION_TOLERANCE, offsetX, offsetY)) {
          occupiedTargets.add(targetIndex);
          correctUserPieces.add(userPiece.id);
        }
      });
    });

    const shuffledPieces = [...gameState.pieces].sort(() => Math.random() - 0.5);

    for (const userPiece of shuffledPieces) {
      if (correctUserPieces.has(userPiece.id)) {
        continue;
      }

      const candidateTargets = currentLevel.targetShape.pieces
        .map((piece, index) => ({ piece, index }))
        .filter(({ piece, index }) => 
          piece.type === userPiece.type && !occupiedTargets.has(index)
        );

      if (candidateTargets.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateTargets.length);
        const { piece: targetPiece } = candidateTargets[randomIndex];
        
        const correctX = boardCenterX + (targetPiece.position.x - offsetX);
        const correctY = boardCenterY + (targetPiece.position.y - offsetY);

        setGameState(prev => ({
          ...prev,
          pieces: prev.pieces.map(piece =>
            piece.id === userPiece.id
              ? { ...piece, position: { x: correctX, y: correctY }, rotation: targetPiece.rotation }
              : piece
          ),
        }));
        return;
      }
    }
  };

  const checkCompletion = (): boolean => {
    if (!currentLevel) return false;

    const POSITION_TOLERANCE = 10;
    const boardCenterX = 500;
    const boardCenterY = 325;

    // dynamicky offset podla velkosti siluety
    const targetWidth = currentLevel.targetShape.width;
    const targetHeight = currentLevel.targetShape.height;
    const offsetX = targetWidth / 2;
    const offsetY = targetHeight / 2;

    const usedTargetIndices = new Set<number>();

    const allPiecesCorrect = gameState.pieces.every(userPiece => {
      const candidateTargets = currentLevel.targetShape.pieces
        .map((piece, index) => ({ piece, index }))
        .filter(({ piece, index }) => 
          piece.type === userPiece.type && !usedTargetIndices.has(index)
        );

      for (const { piece: targetPiece, index } of candidateTargets) {
        if (piecesMatch(userPiece, targetPiece, boardCenterX, boardCenterY, POSITION_TOLERANCE, offsetX, offsetY)) {
          usedTargetIndices.add(index);
          return true;
        }
      }

      return false;
    });

    // kontrola ci su vsetky targety obsadene
    const allTargetsOccupied = usedTargetIndices.size === currentLevel.targetShape.pieces.length;
    
    // hotovy je level iba ak su vsetky utvary spravne a vsetky targety obsadene
    const isLevelComplete = allPiecesCorrect && allTargetsOccupied;

    if (isLevelComplete && !gameState.isCompleted) {
      setIsActive(false);

      const levelId = currentLevel!.id;
      const currentStats = gameState.stats[levelId];
    
      const oldBest = currentStats?.bestTime;
      const newBest = (oldBest === null || oldBest === undefined || currentTime < oldBest) 
        ? currentTime 
        : oldBest;

      setGameState(prev => ({
        ...prev,
        isCompleted: true,
        completedLevels: [...new Set([...prev.completedLevels, prev.currentLevel])],
        stats: {
          ...prev.stats,
          [levelId]: { ...currentStats, bestTime: newBest }
        }
      }));
    }

    return isLevelComplete;
  };

  const resetLevel = () => {
    if (currentLevel) {
      setCurrentTime(0);
      setIsActive(true);

      const positions = [
        // lava strana
        { x: 80, y: 80 },
        { x: 80, y: 200 },
        { x: 80, y: 320 },
        { x: 80, y: 440 },
        
        // prava strana
        { x: 780, y: 80 },
        { x: 780, y: 200 },
        { x: 780, y: 320 },
        { x: 780, y: 440 },
        
        // spodok
        { x: 200, y: 550 },
        { x: 320, y: 550 },
        { x: 440, y: 550 },
        { x: 560, y: 550 },
        { x: 680, y: 550 },
        
        // backup
        { x: 400, y: 80 },
        { x: 400, y: 200 },
      ];

      const initialPieces = currentLevel.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: positions[index] || { x: 100 + (index * 80) % 800, y: 500 },
        rotation: 0,
      }));
      
      setGameState(prev => {
        const levelId = currentLevel.id;
        const currentStats = prev.stats[levelId] || { bestTime: null, attempts: 0 };
        
        return {
          ...prev,
          pieces: initialPieces,
          isCompleted: false,
          stats: {
            ...prev.stats,
            [levelId]: { 
              ...currentStats, 
              attempts: currentStats.attempts + 1
            }
          }
        };
      });
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentLevel,
        currentTime,
        updatePiecePosition,
        rotatePiece,
        checkCompletion,
        resetLevel,
        loadLevel,
        showHint,
        getUnlockedDifficulties,
        isLevelUnlocked,
      }}  
    >
      {children}
    </GameContext.Provider>
  );
};