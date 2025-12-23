import React from 'react';
import { Link } from 'react-router-dom';
import './ControlsPage.css';

const ControlsPage: React.FC = () => {
  const controls = [
    { icon: '🖱️', title: 'Click', description: 'Click on pieces to select and move them' },
    { icon: '🔄', title: 'Rotate', description: 'Use right-click or R key to rotate pieces' },
    { icon: '↩️', title: 'Undo', description: 'Press U or click Undo to revert last move' },
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
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>  
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
          <Link to="/levels" className="action-btn action-primary">
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