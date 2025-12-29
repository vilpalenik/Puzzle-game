import React from 'react';
import type { TargetShape as TargetShapeType, PieceType } from '../types/game';

interface TargetShapeProps {
  targetShape: TargetShapeType;
}

const PIECE_PATHS: Record<PieceType, string> = {
  'large-triangle': 'M 0,0 L 150,0 L 0,150 Z',
  'medium-triangle': 'M 0,0 L 0,106.066 L 106.066,0 Z',
  'small-triangle': 'M 0,0 L 75,0 L 0,75 Z',
  'square': 'M 0,0 L 75,0 L 75,75 L 0,75 Z',
  'parallelogram': 'M 0,0 L 106.066,0 L 159.099,53.033 L 53.033,53.033 Z',
};

const PIECE_CENTERS: Record<PieceType, { x: number; y: number }> = {
  'large-triangle': { x: 50, y: 50 },
  'medium-triangle': { x: 35.35, y: 35.35 },
  'small-triangle': { x: 25, y: 25 },
  'square': { x: 37.5, y: 37.5 },
  'parallelogram': { x: 79.5, y: 26.5 },
};

export const TargetShape: React.FC<TargetShapeProps> = ({ targetShape }) => {
  return (
    <div style={{ 
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <svg
        width={targetShape.width}
        height={targetShape.height}
        viewBox={`0 0 ${targetShape.width} ${targetShape.height}`}
        style={{ display: 'block' }}
      >
        {targetShape.pieces.map((piece) => {
          const center = PIECE_CENTERS[piece.type];
          
          return (
            <g
              key={piece.id}
              transform={`translate(${piece.position.x}, ${piece.position.y})`}
            >
              {/* Rotácia okolo centra kúsku - ROVNAKÁ ako v TangramPiece */}
              <g transform={`rotate(${piece.rotation} ${center.x} ${center.y})`}>
                <path
                  d={PIECE_PATHS[piece.type]}
                  fill="#000000"
                  stroke="none"
                />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};