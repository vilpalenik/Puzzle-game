import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import './DifficultyPage.css';


// stranka s vyberom obtiaznosti
const DifficultyPage: React.FC = () => {
  const navigate = useNavigate();
  const { getUnlockedDifficulties, gameState } = useGame();
  
  const difficulties = [
    { 
      name: 'Easy', 
      color: 'easy',
      icon: '🌱',
      description: 'Perfect for beginners',
      levels: [1, 2, 3]
    },
    { 
      name: 'Medium', 
      color: 'medium',
      icon: '🔥',
      description: 'Ready for a challenge?',
      levels: [4, 5, 6]
    },
    { 
      name: 'Hard', 
      color: 'hard',
      icon: '💀',
      description: 'For true masters',
      levels: [7, 8, 9]
    }
  ];

  const unlockedDifficulties = getUnlockedDifficulties();
  const allUnlocked = unlockedDifficulties.includes('All');

  const handleDifficultySelect = (difficulty: typeof difficulties[0]) => {
    // zisti nedokoncene levely danej obtiaznosti
    const incompleteLevels = difficulty.levels.filter(
      levelId => !gameState.completedLevels.includes(levelId)
    );

    if (incompleteLevels.length > 0) {
      // nahodne vyber nedokonceny level
      const randomLevel = incompleteLevels[Math.floor(Math.random() * incompleteLevels.length)];
      navigate(`/game/${randomLevel}`);
    } else {
      // vsetky levely danej obtiaznosti su dokoncene, prejdi na vyber levelov
      navigate(`/levels/${difficulty.name.toLowerCase()}`);
    }
  };

  const getDifficultyProgress = (difficulty: typeof difficulties[0]) => {
    const completed = difficulty.levels.filter(
      levelId => gameState.completedLevels.includes(levelId)
    ).length;
    return { completed, total: difficulty.levels.length };
  };

  const isDifficultyUnlocked = (difficultyName: string) => {
    return unlockedDifficulties.includes(difficultyName) || allUnlocked;
  };

  return (
    <div className="difficulty-container">
      <div className="difficulty-wrapper">
        <Link to="/" className="back-btn">
          ← Back
        </Link>

        <div className="difficulty-header">
          <h1 className="difficulty-title">
            <span className="title-gradient">CHOOSE DIFFICULTY</span>
          </h1>
          <p className="difficulty-subtitle">Select your challenge level</p>
        </div>

        <div className="difficulties-grid">
          {difficulties.map((difficulty) => {
            const isUnlocked = isDifficultyUnlocked(difficulty.name);
            const progress = getDifficultyProgress(difficulty);
            const isCompleted = progress.completed === progress.total;

            return (
              <div key={difficulty.name} className="difficulty-card-wrapper">
                {isUnlocked ? (
                  <button
                    onClick={() => handleDifficultySelect(difficulty)}
                    className={`difficulty-card difficulty-card-${difficulty.color} ${
                      isCompleted ? 'difficulty-completed' : ''
                    }`}
                  >
                    <div className="difficulty-icon">{difficulty.icon}</div>
                    <h2 className="difficulty-name">{difficulty.name}</h2>
                    <p className="difficulty-description">{difficulty.description}</p>
                    
                    <div className="difficulty-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        />
                      </div>
                      <p className="progress-text">
                        {progress.completed} / {progress.total} completed
                      </p>
                    </div>

                    {isCompleted && (
                      <div className="completed-badge-diff">
                        <span className="completed-icon">✓</span>
                      </div>
                    )}

                    <div className="play-button">
                      {isCompleted ? 'Choose Level' : 'Play'}
                    </div>
                  </button>
                ) : (
                  <div className={`difficulty-card difficulty-card-locked`}>
                    <div className="lock-icon-diff">🔒</div>
                    <h2 className="difficulty-name difficulty-name-locked">{difficulty.name}</h2>
                    <p className="difficulty-description">Complete previous levels</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allUnlocked && (
          <div className="all-completed-banner">
            <p className="all-completed-text">
              🏆 Congratulations! You've completed all levels!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultyPage;