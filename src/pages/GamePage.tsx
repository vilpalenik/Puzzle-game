import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TangramPiece } from '../components/TangramPiece';
import { TargetShape } from '../components/TargetShape';
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
  
  const {
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
  } = useGame();

  const levelStats = currentLevel ? gameState.stats[currentLevel.id] : null;
  const [showCelebration, setShowCelebration] = useState(false);

  // Lokálny scale state
  const [scale, setScale] = useState(1.0);
  const [boardWidth, setBoardWidth] = useState(1000);

  // Sledovanie šírky wrappera a nastavenie scale
  useEffect(() => {
    const updateScale = () => {
      const wrapper = document.querySelector('.game-wrapper-simple');
      if (wrapper) {
        const wrapperWidth = wrapper.clientWidth;
        const targetBoardWidth = wrapperWidth * 0.9; // 90% šírky wrappera
        const baseWidth = 1000; // pôvodná šírka board
        const newScale = targetBoardWidth / baseWidth;
        
        setScale(newScale);
        setBoardWidth(targetBoardWidth);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (id) {
      loadLevel(parseInt(id));
      setShowCelebration(false); // Reset celebration pri zmene levelu
    }
  }, [id]);

  useEffect(() => {
    if (gameState.pieces.length > 0 && !gameState.isCompleted) {
      const completed = checkCompletion();
      if (completed) {
        setShowCelebration(true);
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
    setShowCelebration(false); // skryt celebration pred prechodom
    
    // zisti obtiažnosť aktuálneho levelu
    const difficulty = currentLevel.difficulty;
    
    // vsetky levely
    const allLevels = [
      { id: 1, difficulty: 'Easy'},
      { id: 2, difficulty: 'Easy'},
      { id: 3, difficulty: 'Easy'},
      { id: 4, difficulty: 'Medium'},
      { id: 5, difficulty: 'Medium'},
      { id: 6, difficulty: 'Medium'},
      { id: 7, difficulty: 'Hard'},
      { id: 8, difficulty: 'Hard'},
      { id: 9, difficulty: 'Hard'},
    ];
    
    // Levely tej istej obtiažnosti
    const sameDifficultyLevels = allLevels.filter(
      l => l.difficulty === difficulty
    );
    
    // Nevyriešené levely z tej istej obtiažnosti
    const incompleteLevels = sameDifficultyLevels.filter(
      l => !gameState.completedLevels.includes(l.id)
    );
    
    if (incompleteLevels.length > 0) {
      // Náhodne vyber jeden nevyriešený level
      const randomLevel = incompleteLevels[Math.floor(Math.random() * incompleteLevels.length)];
      navigate(`/game/${randomLevel.id}`);
    } else {
      // Všetky levely tejto obtiažnosti sú dokončené
      // Skontroluj či existuje ďalšia odomknutá obtiažnosť
      const unlockedDifficulties = getUnlockedDifficulties();
      
      if (difficulty === 'Easy' && unlockedDifficulties.includes('Medium')) {
        // Easy dokončené, choď na Medium
        navigate('/difficulties');
      } else if (difficulty === 'Medium' && unlockedDifficulties.includes('Hard')) {
        // Medium dokončené, choď na Hard
        navigate('/difficulties');
      } else {
        // Všetko dokončené
        navigate('/difficulties');
      }
    }
  };

  const handleBackToLevels = () => {
    // Zisti obtiažnosť aktuálneho levelu
    const difficulty = currentLevel.difficulty.toLowerCase();
    
    // Zisti či sú všetky levely tejto obtiažnosti dokončené
    const allLevels = [
      { id: 1, difficulty: 'Easy'},
      { id: 2, difficulty: 'Easy'},
      { id: 3, difficulty: 'Easy'},
      { id: 4, difficulty: 'Medium'},
      { id: 5, difficulty: 'Medium'},
      { id: 6, difficulty: 'Medium'},
      { id: 7, difficulty: 'Hard'},
      { id: 8, difficulty: 'Hard'},
      { id: 9, difficulty: 'Hard'},
    ];
    
    const levelsOfThisDifficulty = allLevels.filter(
      l => l.difficulty.toLowerCase() === difficulty
    );
    
    const completedCount = levelsOfThisDifficulty.filter(
      l => gameState.completedLevels.includes(l.id)
    ).length;
    
    // Ak sú všetky dokončené, choď na výber levelov
    if (completedCount === levelsOfThisDifficulty.length) {
      navigate(`/levels/${difficulty}`);
    } else {
      // Inak choď na výber obtiažnosti
      navigate('/difficulties');
    }
  };

  return (
    <div className="game-container">
      <div className="game-wrapper-simple">
        
        {/* Top Bar */}
        <div className="game-top-bar">
          <button onClick={handleBackToLevels} className="back-link">
            ← Back
          </button>
          
          <div className="game-title-center">
            <h1>Level {currentLevel.id}: {currentLevel.name}</h1>
            <span className={`badge-${currentLevel.difficulty.toLowerCase()}`}>
              {currentLevel.difficulty}
            </span>
          </div>

          <div className="game-stats-hud">
            <div className="stat-item">
              <span className="stat-label">Current time </span>
              <span className="stat-value timer-running">{formatTime(currentTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best time</span>
              <span className="stat-value">{formatTime(levelStats?.bestTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Attempts</span>
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
            width: `${boardWidth}px`,
            height: `${650 * scale}px`,
            margin: '0 auto',
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
          <p>💡 Drag pieces with mouse or finger • Rotate the shapes by double-clicking</p>
          {gameState.completedLevels.includes(currentLevel.id) && (
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Done!</p>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="game-actions">
          <button onClick={handleBackToLevels} className="btn-secondary">
            Back to Levels
          </button>
          <Link to="/" className="btn-tertiary">Menu</Link>
        </div>
      </div>

      {/* Celebration popup */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h1>🎉 Good job! 🎉</h1>
            <p>Level completed! {currentLevel.id}: {currentLevel.name}!</p>
            <div className="celebration-buttons">
              {currentLevel.id < 9 ? (
                <button onClick={handleNextLevel} className="btn-next">
                  Next level →
                </button>
              ) : (
                <button onClick={() => navigate('/difficulties')} className="btn-next">
                  Back to difficulties
                </button>
              )}
              <button onClick={() => setShowCelebration(false)} className="btn-continue">
                continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;