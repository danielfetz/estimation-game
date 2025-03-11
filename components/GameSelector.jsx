import React from 'react';
import { gameCategories } from '../data/questions';
import { Trophy, Star, Calendar } from 'lucide-react';

const GameSelector = ({ onSelectGame, onViewLeaderboard }) => {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Estimation Game</h1>
        <p className="text-gray-600">Test your calibration skills across different topics</p>
      </header>
      
      {gameCategories.map((category) => {
        const isWeeklyCategory = category.id === 'ww2';
        
        return (
          <div key={category.id} className={`space-y-4 ${isWeeklyCategory ? 'border-2 border-blue-400 p-5 rounded-lg bg-blue-50' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold pb-2">{category.name}</h2>
              
              {isWeeklyCategory && (
                <div className="flex items-center bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  <Calendar size={14} className="mr-1" />
                  <span>Category of the Week</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{category.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.games.map((game) => {
                const isGameOfDay = category.id === 'ww2' && game.id === 'switzerland';
                
                return (
                  <div 
                    key={game.id} 
                    className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden 
                      ${isGameOfDay ? 'border-2 border-yellow-400 relative shadow-md' : ''}`}
                  >
                    {isGameOfDay && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center">
                        <Star size={12} className="mr-1 text-yellow-800" fill="currentColor" />
                        <span className="text-yellow-800">Game of the Day</span>
                      </div>
                    )}
                    
                    <div className={`p-5 ${isGameOfDay ? 'bg-yellow-50' : ''}`}>
                      <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{game.questions.length} questions</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onViewLeaderboard(category.id, game.id)}
                            className="flex items-center bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-300 transition"
                          >
                            <Trophy size={16} className="mr-1" />
                            Leaderboard
                          </button>
                          
                          <button
                            onClick={() => onSelectGame(category.id, game.id)}
                            className={`text-white px-4 py-2 rounded-md text-sm transition ${
                              isGameOfDay 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            Play Game
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameSelector;
