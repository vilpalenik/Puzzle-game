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

  
  const [scale, setScale] = useState(1.0);
  const [boardWidth, setBoardWidth] = useState(1000);

  // nastavenie scale podla sirky wrappera
  useEffect(() => {
    const updateScale = () => {
      const wrapper = document.querySelector('.game-wrapper-simple');
      if (wrapper) {
        const wrapperWidth = wrapper.clientWidth;
        const targetBoardWidth = wrapperWidth * 0.9; // 90% sirka wrappera
        const baseWidth = 1000;
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
      setShowCelebration(false); // reset celebration pri nacitani noveho levelu
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
    
    // obtiaznost aktualneho levelu
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
    
    // levely rovnakej obtiaznosti
    const sameDifficultyLevels = allLevels.filter(
      l => l.difficulty === difficulty
    );
    
    // nevyriesene levely danej obtiaznosti
    const incompleteLevels = sameDifficultyLevels.filter(
      l => !gameState.completedLevels.includes(l.id)
    );
    
    if (incompleteLevels.length > 0) {
      // nahodne vyber jeden nedokonceny level
      const randomLevel = incompleteLevels[Math.floor(Math.random() * incompleteLevels.length)];
      navigate(`/game/${randomLevel.id}`);
    } else {
      // vsetky levely danej obtiaznosti su dokoncene
      // skontroluj ci je dalsia obtiaznost odomknuta
      const unlockedDifficulties = getUnlockedDifficulties();
      
      if (difficulty === 'Easy' && unlockedDifficulties.includes('Medium')) {
        // easy dokoncene, chod na medium
        navigate('/difficulties');
      } else if (difficulty === 'Medium' && unlockedDifficulties.includes('Hard')) {
        // medium dokoncene, chod na hard
        navigate('/difficulties');
      } else {
        // vsetko prejdene
        navigate('/difficulties');
      }
    }
  };

  const handleBackToLevels = () => {
    // zisti obtiaznost aktualneho levelu
    const difficulty = currentLevel.difficulty.toLowerCase();
    
    // zisti vsetky levely danej obtiaznosti
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
    
    // ak su vsetky dokoncene, prejdi na vyber levelov danej obtiaznosti
    if (completedCount === levelsOfThisDifficulty.length) {
      navigate(`/levels/${difficulty}`);
    } else {
      // inac chod na stranku s obtiaznostou
      navigate('/difficulties');
    }
  };

  return (
    <div className="game-container">
      <div className="game-wrapper-simple">
        
        <div className="game-top-bar">
          <button onClick={handleBackToLevels} className="back-link">
            ← Back
          </button>
          
          <div className="game-title-center">
            <h1>{currentLevel.name}</h1>
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

        {/* plocha s tvarmi a siluetou */}
        <div 
          id="game-board" 
          className="game-board-single"
          style={{
            width: `${boardWidth}px`,
            height: `${650 * scale}px`,
            margin: '0 auto',
          }}
        >
          {/* silueta */}
          <TargetShape 
            targetShape={currentLevel.targetShape}
            scale={scale}
          />

          {/* tvary */}
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

        {/* info text */}
        <div className="game-info">
          <p>💡 Drag pieces with mouse or finger • Rotate the shapes by double-clicking</p>
          {gameState.completedLevels.includes(currentLevel.id) && (
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Done!</p>
          )}
        </div>

        {/* spodne tlacitka */}
        <div className="game-actions">
          <button onClick={handleBackToLevels} className="btn-secondary">
            Back to Levels
          </button>
          <Link to="/" className="btn-tertiary">Menu</Link>
        </div>
      </div>

      {/* popup po dokonceni levela */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h1>🎉 Good job! 🎉</h1>
            <p>Level completed: {currentLevel.name}!</p>
            <div className="celebration-buttons">
              <button onClick={handleNextLevel} className="btn-next">
                Next level →
              </button>
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