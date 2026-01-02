import React, { useRef, useState, useEffect } from 'react';
import type { TangramPiece as TangramPieceType, PieceType } from '../types/game';

interface TangramPieceProps {
  piece: TangramPieceType;
  onDrag: (id: string, position: { x: number; y: number }) => void;
  onRotate: (id: string) => void;
  scale: number;
}

const PIECE_PATHS: Record<PieceType, string> = {
  'large-triangle': 'M 0,0 L 150,0 L 0,150 Z',
  'medium-triangle': 'M 0,0 L 0,106.066 L 106.066,0 Z',
  'small-triangle': 'M 0,0 L 75,0 L 0,75 Z',
  'square': 'M 0,0 L 75,0 L 75,75 L 0,75 Z',
  'parallelogram': 'M 0,0 L 106.066,0 L 159.099,53.033 L 53.033,53.033 Z',
};

const PIECE_SIZES: Record<PieceType, number> = {
  'large-triangle': 150,
  'medium-triangle': 107,
  'small-triangle': 75,
  'square': 75,
  'parallelogram': 160,
};

export const TangramPiece: React.FC<TangramPieceProps> = ({
  piece,
  onDrag,
  onRotate,
  scale,
}) => {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pieceRef = useRef<SVGSVGElement>(null);
  const baseSize = PIECE_SIZES[piece.type];
  const size = baseSize * scale;

  // Pre double tap detekciu
  const lastTouchEnd = useRef<number>(0);

  const handleStart = (clientX: number, clientY: number) => {
    setDragging(true);
    const rect = pieceRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragging) return;

    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    const boardRect = gameBoard.getBoundingClientRect();
    
    const newX = (clientX - boardRect.left - dragOffset.x) / scale;
    const newY = (clientY - boardRect.top - dragOffset.y) / scale;

    onDrag(piece.id, { x: newX, y: newY });
  };

  const handleEnd = () => {
    setDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTouch = now - lastTouchEnd.current;

    // Double tap detekcia - ak je čas medzi touchmi < 300ms
    if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
      // Double tap!
      e.preventDefault();
      onRotate(piece.id);
      lastTouchEnd.current = 0; // Reset aby sa nezavolalo znova
    } else {
      lastTouchEnd.current = now;
    }

    handleEnd();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [dragging, dragOffset, scale]);

  const handleDoubleClick = () => {
    onRotate(piece.id);
  };

  return (
    <svg
      ref={pieceRef}
      width={size}
      height={size}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      style={{
        position: 'absolute',
        left: `${piece.position.x * scale}px`,
        top: `${piece.position.y * scale}px`,
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: dragging ? 1000 : 10,
        transition: dragging ? 'none' : 'all 0.1s ease-out',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <g transform={`rotate(${piece.rotation})`}>
        <path
          d={PIECE_PATHS[piece.type]}
          fill={piece.color}
          stroke="#333"
          strokeWidth={2 / scale}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          style={{
            filter: dragging 
              ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))' 
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            pointerEvents: 'auto',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        />
      </g>
    </svg>
  );
};