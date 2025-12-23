import React from 'react';
import { Link } from 'react-router-dom';
import './GamePage.css';

const GamePage: React.FC = () => {
  return (
    <div className="game-container">
      <div className="game-wrapper">
        <Link to="/levels" className="back-link">
            ← Back to Levels
          </Link>
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-gradient">LEVEL</span>
          </h1>
          <p className="game-subtitle">Ready to solve the puzzle?</p>
        </div>

        {/* Game Box */}
        <div className="game-box">
          <div className="game-board">
            
          </div>

          <div className="game-buttons-grid">
            <button className="game-btn btn-reset">Reset</button>
          </div>
        </div>

        {/* Info Section */}
        <div className="game-info">
          <p>- teoreticky nejaké miesto na popis levelu -</p>
        </div>

        {/* Action Buttons */}
        <div className="game-actions">
          <Link to="/levels" className="action-btn action-secondary">
            Back to Levels
          </Link>
          <Link to="/" className="action-btn action-tertiary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamePage;