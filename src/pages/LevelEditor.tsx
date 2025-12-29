// pages/LevelEditor.tsx - NÁSTROJ NA TVORBU LEVELOV

import React, { useState } from 'react';
import { TangramPiece } from '../components/TangramPiece';
import type { TangramPiece as PieceType } from '../types/game';

const LevelEditor: React.FC = () => {
  const [pieces, setPieces] = useState<PieceType[]>([
    {
      id: 'large-triangle-1',
      type: 'large-triangle',
      position: { x: 50, y: 50 },
      rotation: 0,
      color: '#E57373'
    },
    {
      id: 'large-triangle-2',
      type: 'large-triangle',
      position: { x: 50, y: 250 },
      rotation: 0,
      color: '#64B5F6'
    },
    {
      id: 'medium-triangle',
      type: 'medium-triangle',
      position: { x: 250, y: 50 },
      rotation: 0,
      color: '#81C784'
    },
    {
      id: 'small-triangle-1',
      type: 'small-triangle',
      position: { x: 380, y: 50 },
      rotation: 0,
      color: '#FFD54F'
    },
    {
      id: 'small-triangle-2',
      type: 'small-triangle',
      position: { x: 380, y: 150 },
      rotation: 0,
      color: '#FF8A65'
    },
    {
      id: 'square',
      type: 'square',
      position: { x: 50, y: 420 },
      rotation: 0,
      color: '#BA68C8'
    },
    {
      id: 'parallelogram',
      type: 'parallelogram',
      position: { x: 200, y: 420 },
      rotation: 0,
      color: '#4DB6AC'
    },
  ]);

  const updatePiecePosition = (id: string, position: { x: number; y: number }) => {
    setPieces(prev =>
      prev.map(piece =>
        piece.id === id ? { ...piece, position } : piece
      )
    );
  };

  const rotatePiece = (id: string) => {
    setPieces(prev =>
      prev.map(piece =>
        piece.id === id ? { ...piece, rotation: (piece.rotation + 45) % 360 } : piece
      )
    );
  };

  const generateJSON = () => {
    const json = {
      id: 1,
      name: "Nový tvar",
      difficulty: "Easy",
      targetShape: {
        width: 500,
        height: 500,
        pieces: pieces.map(p => ({
          id: p.id,
          type: p.type,
          position: p.position,
          rotation: p.rotation,
          color: p.color
        }))
      }
    };
    
    console.log(JSON.stringify(json, null, 2));
    alert('JSON vygenerovaný! Pozri sa do konzoly (F12)');
  };

  const copyJSON = () => {
    const json = JSON.stringify({
      id: 1,
      name: "Nový tvar",
      difficulty: "Easy",
      targetShape: {
        width: 500,
        height: 500,
        pieces: pieces
      }
    }, null, 2);
    
    navigator.clipboard.writeText(json);
    alert('JSON skopírovaný do schránky!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Level Editor</h1>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          justifyContent: 'center'
        }}>
          <button
            onClick={generateJSON}
            style={{
              padding: '12px 24px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Generuj JSON (konzola)
          </button>
          <button
            onClick={copyJSON}
            style={{
              padding: '12px 24px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Skopíruj JSON
          </button>
        </div>

        <div
          id="game-board"
          style={{
            position: 'relative',
            width: '500px',
            height: '500px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            border: '3px solid #dee2e6',
            borderRadius: '16px',
            overflow: 'visible',
            margin: '0 auto'
          }}
        >
          {pieces.map(piece => (
            <TangramPiece
              key={piece.id}
              piece={piece}
              onDrag={updatePiecePosition}
              onRotate={rotatePiece}
            />
          ))}
        </div>

        {/* Zobrazenie súradníc */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Súradnice kúskov:</h3>
          {pieces.map(piece => (
            <div key={piece.id} style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '5px' }}>
              <strong>{piece.id}:</strong> x:{Math.round(piece.position.x)}, y:{Math.round(piece.position.y)}, rot:{piece.rotation}°
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '600px',
        fontSize: '14px'
      }}>
        <h3>Návod:</h3>
        <ol>
          <li>Ťahaj kúsky myšou a ukladaj ich do tvaru</li>
          <li>Dvojklik = rotácia o 45°</li>
          <li>Keď máš hotovo, klikni "Skopíruj JSON"</li>
          <li>Vlož JSON do <code>levels.json</code></li>
        </ol>
      </div>
    </div>
  );
};

export default LevelEditor;