import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LevelPage.css';

const LevelPage: React.FC = () => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

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
        </div>

        <div className="levels-grid">
          {levels.map((level) => (
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
                }`}
              >
                <div className="level-number">
                  {String(level.id).padStart(2, '0')}
                </div>
                <div className="level-difficulty">{level.difficulty}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelPage;