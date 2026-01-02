import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import DifficultyPage from './pages/DifficultyPage';
import LevelPage from './pages/LevelPage';
import GamePage from './pages/GamePage';
import ControlsPage from './pages/ControlsPage';

const App: React.FC = () => {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/difficulties" element={<DifficultyPage />} />
            <Route path="/levels/:difficulty" element={<LevelPage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/controls" element={<ControlsPage />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
};

export default App;