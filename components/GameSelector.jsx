import React, { useState, useEffect } from 'react';
import { gameCategories } from '../data/questions';
import { Trophy, Star, Calendar, Clock, Lock } from 'lucide-react';

const GameSelector = ({ onSelectGame, onViewLeaderboard }) => {
  // State for countdown timers
  const [countdowns, setCountdowns] = useState({});
  
  // Function to format date as "Month Day"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };
  
  // Initialize and update countdown timers
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns = {};
      
      gameCategories.forEach(category => {
        category.games.forEach(game => {
          if (game.comingSoon && game.releaseDate) {
            const releaseDate = new Date(game.releaseDate);
            const timeRemaining = releaseDate - now;
            
            if (timeRemaining > 0) {
              // Calculate hours, minutes, seconds
              const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
              
              newCountdowns[`${category.id}-${game.id}`] = {
                hours,
                minutes,
                seconds,
                expired: false
              };
            } else {
              newCountdowns[`${category.id}-${game.id}`] = {
                hours: 0,
                minutes: 0,
                seconds: 0,
                expired: true
              };
            }
          }
        });
      });
      
      setCountdowns(newCountdowns);
    };
    
    // Update immediately and then every second
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Estimation Game</h1>
        <p className="text-gray-600">Test your calibration skills across different topics</p>
      </header>
      
      {gameCategories.map((category) => {
        const isFeaturedCategory = category.featured;
        
        return (
          <div key={category.id} className={`space-y-4 ${isFeaturedCategory ? 'border-2 border-blue-400 p-5 rounded-lg relative' : ''}`}>
            {isFeaturedCategory && (
              <div className="absolute -top-3 right-5 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>Category of the Week</span>
              </div>
            )}
            
            <div className="mt-3">
              <h2 className="text-2xl font-bold pb-2">{category.name}</h2>
              <p className="text-gray-700 mb-4">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.games.map((game) => {
                const isFeaturedGame = game.featured;
                const formattedDate = formatDate(game.addedDate);
                const isComingSoon = game.comingSoon;
                const countdown = countdowns[`${category.id}-${game.id}`];
                
                return (
                  <div 
                    key={game.id} 
                    className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative 
                      ${isFeaturedGame ? 'border-2 border-yellow-400 shadow-md' : ''}
                      ${isComingSoon ? 'border-2 border-purple-400 shadow-md' : ''}`}
                  >
                    {/* Badge for game status */}
                    {(isFeaturedGame || formattedDate || isComingSoon) && (
                      <div className={`absolute -top-1 -right-1 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center ${
                        isFeaturedGame ? 'bg-yellow-400 text-yellow-800' : 
                        isComingSoon ? 'bg-purple-400 text-purple-900' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isFeaturedGame ? (
                          <>
                            <Star size={12} className="mr-1" fill="currentColor" />
                            <span>Game of the Day</span>
                          </>
                        ) : isComingSoon ? (
                          <>
                            <Clock size={12} className="mr-1" />
                            <span>Coming Soon</span>
                          </>
                        ) : (
                          <>
                            <Calendar size={12} className="mr-1" />
                            <span>{formattedDate}</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className={`p-5 ${
                      isFeaturedGame ? 'bg-yellow-50' : 
                      isComingSoon ? 'bg-purple-50' : ''
                    }`}>
                      <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      
                      {/* Display countdown for coming soon games */}
                      {isComingSoon && countdown && (
                        <div className="mb-4 bg-purple-100 p-3 rounded-md">
                          <p className="font-medium text-purple-900 mb-1">Available in:</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white rounded p-2">
                              <span className="text-xl font-bold text-purple-800">{String(countdown.hours).padStart(2, '0')}</span>
                              <p className="text-xs text-purple-600">Hours</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <span className="text-xl font-bold text-purple-800">{String(countdown.minutes).padStart(2, '0')}</span>
                              <p className="text-xs text-purple-600">Minutes</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <span className="text-xl font-bold text-purple-800">{String(countdown.seconds).padStart(2, '0')}</span>
                              <p className="text-xs text-purple-600">Seconds</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
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
                          
                          {isComingSoon ? (
                            <button
                              disabled
                              className="flex items-center bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm cursor-not-allowed"
                            >
                              <Lock size={16} className="mr-1" />
                              Locked
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectGame(category.id, game.id)}
                              className={`text-white px-4 py-2 rounded-md text-sm transition ${
                                isFeaturedGame 
                                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              Play Game
                            </button>
                          )}
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
