// components/LeaderboardView.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Award, Medal, AlertTriangle } from 'lucide-react';
import supabase from '../lib/supabase';
import { gameCategories } from '../data/questions';

const LeaderboardView = ({ categoryId, gameId, onBackToSelection }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Find game info
  const category = gameCategories.find(c => c.id === categoryId);
  const game = category?.games.find(g => g.id === gameId);
  const gameName = game?.name || 'Leaderboard';
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('categoryId', categoryId)
          .eq('gameId', gameId)
          .order('score', { ascending: false })
          .limit(10);
          
        if (error) {
          throw error;
        }
          
        if (data && data.length > 0) {
          setLeaderboard(data);
        } else {
          // Use default leaderboard if no data
          setLeaderboard([
            { name: "No scores yet", score: "-", date: "-", correctAnswers: "-", totalQuestions: "-" }
          ]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [categoryId, gameId]);
  
  return (
    <div className="max-w-lg mx-auto p-4">
      <header className="text-center mb-8 relative">
        <button 
          onClick={onBackToSelection}
          className="absolute left-0 top-1 p-2 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-2">{gameName} Leaderboard</h1>
        <p className="text-gray-600">Top players and their scores</p>
      </header>
      
      <main className="bg-white shadow-md rounded-lg p-6">
        {isLoading ? (
          <div className="text-center p-4">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 p-4">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <Trophy size={16} className="text-yellow-500 mr-1" />}
                        {index === 1 && <Award size={16} className="text-gray-400 mr-1" />}
                        {index === 2 && <Medal size={16} className="text-yellow-700 mr-1" />}
                        <span>{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {entry.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right font-medium">
                      {entry.score === "-" ? "-" : entry.score}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {entry.correctAnswers === "-" ? "-" : 
                        ((entry.correctAnswers / entry.totalQuestions) * 100).toFixed(0) + "%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="mr-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Refresh
          </button>
          <button
            onClick={onBackToSelection}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Back to Games
          </button>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardView;
