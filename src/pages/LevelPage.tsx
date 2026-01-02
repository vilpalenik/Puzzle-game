import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import './LevelPage.css';

const LevelPage: React.FC = () => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const { getUnlockedDifficulties, isLevelUnlocked, gameState } = useGame();

  const levels = [
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

  const unlockedDifficulties = getUnlockedDifficulties();
  const allUnlocked = unlockedDifficulties.includes('All');

  return (
    <div className="level-container">
      <div className="level-wrapper">
        <Link to="/" className="back-btn">
          ← Back
        </Link>
        <div className="level-header">
          <h1 className="level-title">
            <span className="title-gradient">SELECT LEVEL</span>
          </h1>
          <p className="level-subtitle">Choose your puzzle challenge</p>
          
          {/* Zobrazenie statusu odomknutia */}
          {!allUnlocked && (
            <div className="unlock-status">
              <p className="unlock-text">
                {unlockedDifficulties.includes('Medium') && !unlockedDifficulties.includes('Hard') && 
                  '🎯 Medium unlocked! Complete all Medium to unlock Hard.'}
                {unlockedDifficulties.includes('Hard') && 
                  '🔥 Hard unlocked! Complete all Hard to unlock everything.'}
                {!unlockedDifficulties.includes('Medium') && 
                  '🎮 Complete all Easy levels to unlock Medium!'}
              </p>
            </div>
          )}
          
          {allUnlocked && (
            <div className="unlock-status">
              <p className="unlock-text unlock-complete">
                🏆 All levels unlocked! You're a Tangram master!
              </p>
            </div>
          )}
        </div>

        <div className="levels-grid">
          {levels.map((level) => {
            const isUnlocked = isLevelUnlocked(level.id);
            const isCompleted = gameState.completedLevels.includes(level.id);
            
            return (
              <div key={level.id}>
                {isUnlocked ? (
                  <Link
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
                ) : (
                  <div className="level-card-link level-card-locked">
                    <div className="level-card level-card-locked-style">
                      <div className="lock-icon">🔒</div>
                      <div className="level-number level-number-locked">
                        {String(level.id).padStart(2, '0')}
                      </div>
                      <div className="level-difficulty">{level.difficulty}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelPage;