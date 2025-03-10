import React from 'react';
import { gameCategories } from '../data/questions';

const GameSelector = ({ onSelectGame }) => {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Estimation Game</h1>
        <p className="text-gray-600">Test your calibration skills across different topics</p>
      </header>
      
      {gameCategories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">{category.name}</h2>
          <p className="text-gray-700 mb-4">{category.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.games.map((game) => (
              <div 
                key={game.id} 
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => onSelectGame(category.id, game.id)}
              >
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{game.questions.length} questions</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
                      Play Game
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameSelector;
