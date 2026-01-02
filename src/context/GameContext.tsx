import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Level, LevelsData, PieceType } from '../types/game';
import levelsDataRaw from '../data/levels.json';

const levelsData = levelsDataRaw as LevelsData;

// Symetria pre každý typ kúsku (v stupňoch)
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

  // Efekt pre bežiaci čas
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

  const loadLevel = (levelId: number) => {
    const level = levelsData.levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevel(level);
      setCurrentTime(0);
      setIsActive(true);

      // Bezpečný prístup k stats
      const currentStats = (gameState.stats && gameState.stats[levelId]) 
        ? gameState.stats[levelId] 
        : { bestTime: null, attempts: 0 };
      
      // ROZŠÍRENÉ POZÍCIE PRE VIAC KÚSKOV (až 15)
      const basePositions = [
        // Ľavá strana
        { x: 80, y: 80 },
        { x: 80, y: 200 },
        { x: 80, y: 320 },
        { x: 80, y: 440 },
        
        // Pravá strana
        { x: 780, y: 80 },
        { x: 780, y: 200 },
        { x: 780, y: 320 },
        { x: 780, y: 440 },
        
        // Spodok - viac priestoru
        { x: 200, y: 550 },
        { x: 320, y: 550 },
        { x: 440, y: 550 },
        { x: 560, y: 550 },
        { x: 680, y: 550 },
        
        // Backup pozície ak by bolo ešte viac kúskov
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
      if (Math.abs(diff - 180) < 1) {
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
    const symmetry = PIECE_SYMMETRY[userPiece.type];
    const normalizeRotation = (rot: number) => ((rot % 360) + 360) % 360;
    
    const userNorm = normalizeRotation(userPiece.rotation);
    const targetNorm = normalizeRotation(targetPiece.rotation);
    
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

    // Penalizácia 30 sekúnd
    setCurrentTime(prev => prev + 30);

    const boardCenterX = 500;
    const boardCenterY = 325;
    const POSITION_TOLERANCE = 10;

    // DYNAMICKÝ OFFSET PODĽA VEĽKOSTI SILUETY
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

    // DYNAMICKÝ OFFSET PODĽA VEĽKOSTI SILUETY
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

    // Kontrola, či sú obsadené VŠETKY target pieces
    const allTargetsOccupied = usedTargetIndices.size === currentLevel.targetShape.pieces.length;
    
    // Completion je len vtedy, keď sú splnené OBE podmienky
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
        // Ľavá strana
        { x: 80, y: 80 },
        { x: 80, y: 200 },
        { x: 80, y: 320 },
        { x: 80, y: 440 },
        
        // Pravá strana
        { x: 780, y: 80 },
        { x: 780, y: 200 },
        { x: 780, y: 320 },
        { x: 780, y: 440 },
        
        // Spodok
        { x: 200, y: 550 },
        { x: 320, y: 550 },
        { x: 440, y: 550 },
        { x: 560, y: 550 },
        { x: 680, y: 550 },
        
        // Backup
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
      }}  
    >
      {children}
    </GameContext.Provider>
  );
};