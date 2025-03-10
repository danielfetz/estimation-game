import { useState } from 'react';
import GameSelector from '../components/GameSelector';
import EstimationGame from '../components/EstimationGame';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(null);
  
  const handleSelectGame = (categoryId, gameId) => {
    setSelectedGame({ categoryId, gameId });
  };
  
  const handleBackToSelection = () => {
    setSelectedGame(null);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {selectedGame ? (
        <EstimationGame 
          categoryId={selectedGame.categoryId}
          gameId={selectedGame.gameId}
          onBackToSelection={handleBackToSelection}
        />
      ) : (
        <GameSelector onSelectGame={handleSelectGame} />
      )}
    </div>
  );
}
