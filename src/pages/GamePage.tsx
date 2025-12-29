import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TangramPiece } from '../components/TangramPiece';
import { TargetShape } from '../components/TargetShape';
import './GamePage.css';

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    gameState,
    currentLevel,
    updatePiecePosition,
    rotatePiece,
    checkCompletion,
    resetLevel,
    loadLevel,
    showHint,
  } = useGame();

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (id) {
      loadLevel(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (gameState.pieces.length > 0 && !gameState.isCompleted) {
      const completed = checkCompletion();
      if (completed) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }
  }, [gameState.pieces]);

  if (!currentLevel) {
    return (
      <div className="game-container">
        <div className="game-wrapper-simple">
          <p style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleNextLevel = () => {
    const nextId = currentLevel.id + 1;
    if (nextId <= 9) {
      navigate(`/game/${nextId}`);
    } else {
      navigate('/levels');
    }
  };

  return (
    <div className="game-container">
      <div className="game-wrapper-simple">
        
        {/* Top Bar */}
        <div className="game-top-bar">
          <Link to="/levels" className="back-link">← Levely</Link>
          
          <div className="game-title-center">
            <h1>Level {currentLevel.id}: {currentLevel.name}</h1>
            <span className={`badge-${currentLevel.difficulty.toLowerCase()}`}>
              {currentLevel.difficulty}
            </span>
          </div>

          <div className="game-controls">
            <button onClick={showHint} className="btn-hint" title="Hint">
              💡 Hint
            </button>
            <button onClick={resetLevel} className="btn-reset" title="Reset">
              🔄 Reset
            </button>
          </div>
        </div>

        {/* HLAVNÁ HRACIA PLOCHA */}
        <div id="game-board" className="game-board-single">
          
          {/* ČIERNA SILUETA v strede */}
          <TargetShape targetShape={currentLevel.targetShape} />

          {/* FAREBNÉ KÚSKY ktoré ťaháš */}
          {gameState.pieces.map((piece) => (
            <TangramPiece
              key={piece.id}
              piece={piece}
              onDrag={updatePiecePosition}
              onRotate={rotatePiece}
            />
          ))}
        </div>

        {/* Info text */}
        <div className="game-info">
          <p>💡 Ťahaj kúsky myšou • Rotuj dvojklikom</p>
          {gameState.completedLevels.includes(currentLevel.id) && (
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Dokončené!</p>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="game-actions">
          <Link to="/levels" className="btn-secondary">Späť na levely</Link>
          <Link to="/" className="btn-tertiary">Menu</Link>
        </div>
      </div>

      {/* Celebration popup */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h1>🎉 Výborne! 🎉</h1>
            <p>Dokončil si level {currentLevel.id}: {currentLevel.name}!</p>
            <div className="celebration-buttons">
              {currentLevel.id < 9 ? (
                <button onClick={handleNextLevel} className="btn-next">
                  Ďalší level →
                </button>
              ) : (
                <Link to="/levels" className="btn-next">Späť na levely</Link>
              )}
              <button onClick={() => setShowCelebration(false)} className="btn-continue">
                Pokračovať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;