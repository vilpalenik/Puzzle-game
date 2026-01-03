import React from 'react';
import { Link } from 'react-router-dom';
import './ControlsPage.css';

// stranka s ovladanim hry
const ControlsPage: React.FC = () => {
  const controls = [
    { icon: '🖱️', title: 'Click and drag', description: 'Click on pieces to select and move them by dragging' },
    { icon: '🔄', title: 'Rotate', description: 'Use double-click to rotate pieces' },
    { icon: '↩️', title: 'Reset', description: 'Reset the game by clicking the reset button' },
    { icon: '✅', title: 'Complete Level', description: 'Finish the level by correctly placing all pieces' },
    { icon: '💡', title: 'Hint', description: 'Use the hint button to get help with difficult levels' },
    { icon: '🔥', title: 'Difficulties', description: 'Try different difficulty levels to challenge yourself' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="controls-container">
      <div className="controls-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/" className="back-btn">
            ← Home
          </Link>
          <button onClick={handlePrint} className="action-btn action-primary" style={{ margin: 0 }}>
            🖨️ Print
          </button>
        </div>
        
        <div className="controls-header">
          <h1 className="controls-title">
            <span className="title-gradient">HOW TO PLAY</span>
          </h1>
        </div>

        <div className="description-box">
          <h2>What is SHAPE BUILDER ?</h2>
            <p>Shape Builder is a minimalist puzzle game that challenges your logic and spatial thinking.
Manipulate and arrange geometric shapes to recreate specific patterns and complete each level.
With increasing difficulty and time-based challenges, players can test their precision, speed, and problem-solving skills while striving for the best possible completion time.
                </p>  
        </div>
        
        <div className="controls-grid">
          {controls.map((control, idx) => (
            <div key={idx} className="control-card">
              <div className="control-icon">{control.icon}</div>
              <h3 className="control-title">{control.title}</h3>
              <p className="control-description">{control.description}</p>
            </div>
          ))}
        </div>

        <div className="controls-actions">
          <Link to="/difficulties" className="action-btn action-primary">
            Start Playing
          </Link>
          <Link to="/" className="action-btn action-secondary">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ControlsPage;