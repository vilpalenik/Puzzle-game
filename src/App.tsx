import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LevelPage from './pages/LevelPage';
import GamePage from './pages/GamePage';
import ControlsPage from './pages/ControlsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {/* Simple Navigation for PWA behavior */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/levels" element={<LevelPage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/controls" element={<ControlsPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;