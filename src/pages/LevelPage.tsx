import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import './LevelPage.css';

const LevelPage: React.FC = () => {
  const { difficulty } = useParams<{ difficulty?: string }>();
  const navigate = useNavigate();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const { gameState } = useGame();

  // Ak nie je špecifikovaná obtiažnosť, presmeruj na difficulty page
  if (!difficulty) {
    navigate('/difficulties');
    return null;
  }

  const difficultyMap: Record<string, string> = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
  };

  const selectedDifficulty = difficultyMap[difficulty.toLowerCase()];

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

  const levels = allLevels.filter(l => l.difficulty === selectedDifficulty);

  return (
    <div className="level-container">
      <div className="level-wrapper">
        <Link to="/difficulties" className="back-btn">
          ← Back to Difficulties
        </Link>
        <div className="level-header">
          <h1 className="level-title">
            <span className="title-gradient">{selectedDifficulty.toUpperCase()} LEVELS</span>
          </h1>
          <p className="level-subtitle">Choose which level to replay</p>
        </div>

        <div className="levels-grid">
          {levels.map((level) => {
            const isCompleted = gameState.completedLevels.includes(level.id);
            
            return (
              <Link
                key={level.id}
                to={`/game/${level.id}`}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                className="level-card-link"
              >
                <div
                  className={`level-card level-card-${level.difficulty.toLowerCase()} ${
                    hoveredLevel === level.id ? 'level-card-hovered' : ''
                  } ${isCompleted ? 'level-card-completed' : ''}`}
                >
                  {isCompleted && (
                    <div className="completed-badge">
                      <span className="completed-icon">✓</span>
                    </div>
                  )}
                  <div className="level-number">
                    {String(level.id).padStart(2, '0')}
                  </div>
                  <div className="level-difficulty">{level.difficulty}</div>
                  {isCompleted && (
                    <div className="completed-text">Completed</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelPage;