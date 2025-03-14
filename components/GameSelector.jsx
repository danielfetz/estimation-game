import React, { useState, useEffect } from 'react';
import { gameCategories } from '../data/questions';
import { Trophy, Star, Calendar, Clock, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import supabase from '../lib/supabase';

const GameSelector = ({ onSelectGame, onViewLeaderboard }) => {
  // States for dynamic game status
  const [gameStatuses, setGameStatuses] = useState({});
  const [countdown, setCountdown] = useState(null);
  const [nextUpcomingGame, setNextUpcomingGame] = useState(null);
  
  // Email subscription state
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null); // 'success', 'error', or null
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to format date as "Month Day"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };
  
  // Handle email subscription
  const handleSubscribe = async () => {
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setSubscriptionStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would integrate with your actual email service
      // This is a placeholder for the actual implementation
      // Example with Supabase:
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ email, subscribed_at: new Date() }]);
        
      if (error) throw error;
      
      // If successful
      setSubscriptionStatus('success');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubscriptionStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscriptionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Initialize and manage game statuses
  useEffect(() => {
    const updateGameStatuses = () => {
      const now = new Date();
      const statuses = {};
      let upcomingGames = [];
      
      // First pass - determine basic statuses and collect upcoming games
      gameCategories.forEach(category => {
        category.games.forEach(game => {
          const gameKey = `${category.id}-${game.id}`;
          
          if (game.scheduledRelease) {
            const releaseDate = new Date(game.scheduledRelease);
            const isReleased = now >= releaseDate;
            
            statuses[gameKey] = {
              available: isReleased,
              // All released scheduled games become featured
              featured: isReleased
            };
            
            // If not released yet, add to upcoming games list
            if (!isReleased) {
              upcomingGames.push({
                categoryId: category.id,
                gameId: game.id,
                game: game,
                releaseDate: releaseDate,
                // Time until release in milliseconds
                timeUntilRelease: releaseDate - now
              });
            }
          } else {
            // Regular game without scheduled release
            statuses[gameKey] = {
              available: true,
              featured: !!game.featured && 
                // Check if the game has a featured until date
                (!game.scheduledFeaturedUntil || 
                now < new Date(game.scheduledFeaturedUntil))
            };
          }
        });
      });
      
      // Sort upcoming games by release date (earliest first)
      upcomingGames.sort((a, b) => a.timeUntilRelease - b.timeUntilRelease);
      
      // Set the next upcoming game (if any)
      const nextGame = upcomingGames.length > 0 ? upcomingGames[0] : null;
      setNextUpcomingGame(nextGame);
      
      // Calculate countdown for the next upcoming game
      if (nextGame) {
        const timeRemaining = nextGame.timeUntilRelease;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        setCountdown({
          hours,
          minutes,
          seconds
        });
      } else {
        setCountdown(null);
      }
      
      // Update all game statuses
      setGameStatuses(statuses);
    };
    
    // Update immediately and then every second
    updateGameStatuses();
    const interval = setInterval(updateGameStatuses, 1000);
    
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
                const gameKey = `${category.id}-${game.id}`;
                const status = gameStatuses[gameKey] || { available: true, featured: !!game.featured };
                const isAvailable = status.available;
                const isFeatured = status.featured;
                
                // Coming soon preview - only show if it's the next upcoming game
                const isComingSoonPreview = 
                  nextUpcomingGame && 
                  nextUpcomingGame.categoryId === category.id && 
                  nextUpcomingGame.gameId === game.id;
                
                // Only render the game if it's available or it's the next upcoming game
                if (!isAvailable && !isComingSoonPreview) {
                  return null; // Don't show unavailable games except the next preview
                }
                
                return (
                  <div 
                    key={game.id} 
                    className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative 
                      ${isFeatured ? 'border-2 border-yellow-400 shadow-md' : ''}
                      ${isComingSoonPreview ? 'border-2 border-purple-400 shadow-md' : ''}`}
                  >
                    {/* Badge for game status */}
                    <div className={`absolute -top-1 -right-1 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center ${
                      isFeatured ? 'bg-yellow-400 text-yellow-800' : 
                      isComingSoonPreview ? 'bg-purple-400 text-purple-900' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isFeatured ? (
                        <>
                          <Star size={12} className="mr-1" fill="currentColor" />
                          <span>Game of the Day</span>
                        </>
                      ) : isComingSoonPreview ? (
                        <>
                          <Clock size={12} className="mr-1" />
                          <span>Coming Soon</span>
                        </>
                      ) : (
                        <>
                          <Calendar size={12} className="mr-1" />
                          <span>{formatDate(game.addedDate)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className={`p-5 ${
                      isFeatured ? 'bg-yellow-50' : 
                      isComingSoonPreview ? 'bg-purple-50' : ''
                    }`}>
                      <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      
                      {/* Display countdown for coming soon preview */}
                      {isComingSoonPreview && countdown && (
                        <div className="mb-4 bg-purple-100 p-3 rounded-md">
                          <p className="font-medium text-purple-900 mb-1">Coming as Game of the Day in:</p>
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
                      
                      {/* Email signup form for featured game */}
                      {isFeatured && (
                        <div className="mb-4 bg-yellow-100 p-3 rounded-md">
                          <p className="font-medium text-yellow-900 mb-2">Never miss a new game!</p>
                          {subscriptionStatus === 'success' ? (
                            <div className="bg-green-100 text-green-800 p-2 rounded-md flex items-center">
                              <CheckCircle size={16} className="mr-2" />
                              <p className="text-sm">Thanks for subscribing!</p>
                            </div>
                          ) : (
                            <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); handleSubscribe(); }}>
                              <div className="rounded-md overflow-hidden flex flex-col border border-yellow-300">
                                <input 
                                  type="email" 
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Your email" 
                                  className="w-full p-2 border-0 text-sm focus:ring-yellow-500 focus:outline-none"
                                  disabled={isSubmitting}
                                />
                                <button 
                                  type="submit"
                                  className="bg-yellow-500 text-white py-2 text-sm font-medium hover:bg-yellow-600 transition w-full"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                                </button>
                              </div>
                              {subscriptionStatus === 'error' && (
                                <div className="text-red-600 text-xs flex items-center">
                                  <AlertCircle size={12} className="mr-1" />
                                  <span>Please enter a valid email address</span>
                                </div>
                              )}
                              <p className="text-xs text-yellow-700 italic flex items-center">
                                <Mail size={12} className="mr-1" />
                                Get notified when new "Game of the Day" is released
                              </p>
                            </form>
                          )}
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
                          
                          {!isAvailable ? (
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
                                isFeatured 
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
