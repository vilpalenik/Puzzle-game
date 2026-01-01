import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TangramPiece } from '../components/TangramPiece';
import { TargetShape } from '../components/TargetShape';
import { useWindowSize } from '../hooks/useWindowSize';
import { getScale } from '../utils/scaleHelper';
import './GamePage.css';

const formatTime = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  
  const {
    gameState,
    currentLevel,
    scale,
    currentTime,
    setScale,
    updatePiecePosition,
    rotatePiece,
    checkCompletion,
    resetLevel,
    loadLevel,
    showHint,
  } = useGame();

  // Získame štatistiky pre aktuálny level
  const levelStats = currentLevel ? gameState.stats[currentLevel.id] : null;

  const [showCelebration, setShowCelebration] = useState(false);

  // Aktualizuj scale pri zmene veľkosti okna
  useEffect(() => {
    const newScale = getScale(windowSize.width);
    setScale(newScale);
  }, [windowSize.width, setScale]);

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

          <div className="game-stats-hud">
            <div className="stat-item">
              <span className="stat-label">Aktuálny čas</span>
              <span className="stat-value timer-running">{formatTime(currentTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Najlepší čas</span>
              <span className="stat-value">{formatTime(levelStats?.bestTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pokus</span>
              <span className="stat-value">#{levelStats?.attempts || 1}</span>
            </div>
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

        {/* HRACIA PLOCHA */}
        <div 
          id="game-board" 
          className="game-board-single"
          style={{
            width: `${1000 * scale}px`,
            height: `${650 * scale}px`,
            transform: `scale(1)`,
          }}
        >
          {/* ČIERNA SILUETA */}
          <TargetShape 
            targetShape={currentLevel.targetShape}
            scale={scale}
          />

          {/* FAREBNÉ KÚSKY */}
          {gameState.pieces.map((piece) => (
            <TangramPiece
              key={piece.id}
              piece={piece}
              onDrag={updatePiecePosition}
              onRotate={rotatePiece}
              scale={scale}
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