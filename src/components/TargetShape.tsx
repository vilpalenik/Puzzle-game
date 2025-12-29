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
        style={{ 
          display: 'block',
          shapeRendering: 'crispEdges'
        }}
      >
        {targetShape.pieces.map((piece) => {
          return (
            <g
              key={piece.id}
              transform={`translate(${piece.position.x}, ${piece.position.y}) rotate(${piece.rotation})`}
            >
              <path
                d={PIECE_PATHS[piece.type]}
                fill="#000000"
                stroke="none"
                strokeWidth="0"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};