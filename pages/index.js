// pages/index.js
import { useState } from 'react';
import GameSelector from '../components/GameSelector';
import EstimationGame from '../components/EstimationGame';
import LeaderboardView from '../components/LeaderboardView';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewingLeaderboard, setViewingLeaderboard] = useState(null);
  
  const handleSelectGame = (categoryId, gameId) => {
    setSelectedGame({ categoryId, gameId });
    setViewingLeaderboard(null);
  };
  
  const handleViewLeaderboard = (categoryId, gameId) => {
    setViewingLeaderboard({ categoryId, gameId });
    setSelectedGame(null);
  };
  
  const handleBackToSelection = () => {
    setSelectedGame(null);
    setViewingLeaderboard(null);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {selectedGame ? (
        <EstimationGame 
          categoryId={selectedGame.categoryId}
          gameId={selectedGame.gameId}
          onBackToSelection={handleBackToSelection}
        />
      ) : viewingLeaderboard ? (
        <LeaderboardView
          categoryId={viewingLeaderboard.categoryId}
          gameId={viewingLeaderboard.gameId}
          onBackToSelection={handleBackToSelection}
        />
      ) : (
        <GameSelector 
          onSelectGame={handleSelectGame} 
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
    </div>
  );
}
