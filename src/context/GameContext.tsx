import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Level, LevelsData, PieceType } from '../types/game';
import levelsDataRaw from '../data/levels.json';

const levelsData = levelsDataRaw as LevelsData;

// Symetria pre každý typ kúsku (v stupňoch)
const PIECE_SYMMETRY: Record<PieceType, number> = {
  'large-triangle': 360,    // Žiadna symetria
  'medium-triangle': 360,   
  'small-triangle': 360,    
  'square': 90,             // 0°, 90°, 180°, 270°
  'parallelogram': 180,     // 0°, 180°
};

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
      
      const positions = [
        { x: 80, y: 100 },
        { x: 80, y: 250 },
        { x: 80, y: 400 },
        { x: 780, y: 100 },
        { x: 780, y: 250 },
        { x: 780, y: 400 },
        { x: 330, y: 530 },
      ];

      const initialPieces = level.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: positions[index] || { x: 100 + index * 80, y: 500 },
        rotation: 0,
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

  // Zistí či je rotácia "diagonálna" (45°, 135°, 225°, 315°)
  const isDiagonalRotation = (rotation: number): boolean => {
    const normalized = ((rotation % 360) + 360) % 360;
    const mod = normalized % 90;
    return Math.abs(mod - 45) < 1; // Presne 45°
  };

  // Vypočítaj pozíciu ľavého horného rohu pri danej rotácii
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
    
    // Pre štvorec
    if (pieceType === 'square') {
      const halfDiagonal = 75 * Math.sqrt(2) / 2; // ≈ 53.03
      
      if (baseDiagonal && actualDiagonal) {
        // Obe diagonálne (45° → 135°, 225°, 315°)
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
        // Obe rohové (0° → 90°, 180°, 270°)
        const diff = normalizeRot(actual - base);
        if (Math.abs(diff - 90) < 1) {
          offsetX = 0;
          offsetY = 75;
        } else if (Math.abs(diff - 180) < 1) {
          offsetX = 75;
          offsetY = 75;
        } else if (Math.abs(diff - 270) < 1) {
          offsetX = 75;
          offsetY = 0;
        }
      } else if (!baseDiagonal && actualDiagonal) {
        // Z rohovej na diagonálnu (0° → 45°, 135°, ...)
        offsetX = halfDiagonal;
        offsetY = halfDiagonal;
      } else {
        // Z diagonálnej na rohovú (45° → 0°, 90°, ...)
        offsetX = -halfDiagonal;
        offsetY = -halfDiagonal;
      }
    }
    
    // Pre kosoštvorec (len 180° symetria, bez diagonálnych)
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

  // Kontrola či pieces matchujú (pozícia + rotácia so symetriou)
  const piecesMatch = (
    userPiece: { id: string; type: PieceType; position: { x: number; y: number }; rotation: number; color: string },
    targetPiece: { id: string; type: PieceType; position: { x: number; y: number }; rotation: number; color: string },
    boardCenterX: number,
    boardCenterY: number,
    positionTolerance: number
  ): boolean => {
    const symmetry = PIECE_SYMMETRY[userPiece.type];
    const normalizeRotation = (rot: number) => ((rot % 360) + 360) % 360;
    
    const userNorm = normalizeRotation(userPiece.rotation);
    const targetNorm = normalizeRotation(targetPiece.rotation);
    
    const diff = Math.abs(userNorm - targetNorm);
    const altDiff = 360 - diff;
    const minDiff = Math.min(diff, altDiff);
    
    // BEZ TOLERANCIE - musí byť presne násobok symetrie
    for (let i = 0; i * symmetry <= 360; i++) {
      const symmetricAngle = i * symmetry;
      if (Math.abs(minDiff - symmetricAngle) < 1) { // < 1° tolerancia pre floating point
        // Rotácia sedí! Skontroluj pozíciu
        const baseTargetPos = {
          x: boardCenterX + (targetPiece.position.x - 250),
          y: boardCenterY + (targetPiece.position.y - 250)
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

    const boardCenterX = 500;
    const boardCenterY = 325;
    const POSITION_TOLERANCE = 10;  // ← ZMENENÉ z 30 na 10

    const occupiedTargets = new Set<number>();
    const correctUserPieces = new Set<string>();
    
    gameState.pieces.forEach(userPiece => {
      currentLevel.targetShape.pieces.forEach((targetPiece, targetIndex) => {
        if (targetPiece.type !== userPiece.type) return;
        
        if (piecesMatch(userPiece, targetPiece, boardCenterX, boardCenterY, POSITION_TOLERANCE)) {
          occupiedTargets.add(targetIndex);
          correctUserPieces.add(userPiece.id);
        }
      });
    });

    // NÁHODNE PREMIEŠAJ kúsky pred výberom
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
        
        const correctX = boardCenterX + (targetPiece.position.x - 250);
        const correctY = boardCenterY + (targetPiece.position.y - 250);

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

    const POSITION_TOLERANCE = 10;  // ← ZMENENÉ z 30 na 10
    const boardCenterX = 500;
    const boardCenterY = 325;

    const usedTargetIndices = new Set<number>();

    const allPiecesCorrect = gameState.pieces.every(userPiece => {
      const candidateTargets = currentLevel.targetShape.pieces
        .map((piece, index) => ({ piece, index }))
        .filter(({ piece, index }) => 
          piece.type === userPiece.type && !usedTargetIndices.has(index)
        );

      for (const { piece: targetPiece, index } of candidateTargets) {
        if (piecesMatch(userPiece, targetPiece, boardCenterX, boardCenterY, POSITION_TOLERANCE)) {
          usedTargetIndices.add(index);
          return true;
        }
      }

      return false;
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
        { x: 80, y: 100 },
        { x: 80, y: 250 },
        { x: 80, y: 400 },
        { x: 780, y: 100 },
        { x: 780, y: 250 },
        { x: 780, y: 400 },
        { x: 330, y: 530 },
      ];

      const initialPieces = currentLevel.targetShape.pieces.map((piece, index) => ({
        ...piece,
        position: positions[index] || { x: 100 + index * 80, y: 500 },
        rotation: 0,
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