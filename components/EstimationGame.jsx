import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trophy, Award, Medal, ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';
import { gameCategories } from '../data/questions';

const EstimationGame = ({ categoryId, gameId, onBackToSelection }) => {
  // Find the selected game questions
  const category = gameCategories.find(c => c.id === categoryId);
  const game = category?.games.find(g => g.id === gameId);
  const questions = game?.questions || [];
  const gameName = game?.name || 'Estimation Game';

  // Basic game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStage, setGameStage] = useState('question'); // 'question', 'feedback', 'summary', 'leaderboard-entry'
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Input state
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(80);
  const [inputError, setInputError] = useState('');

  // Fetch leaderboard from Supabase on mount
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
            { name: "History Buff", score: 482, date: "2025-02-20", correctAnswers: 5, totalQuestions: 5 },
            { name: "Expert", score: 375, date: "2025-02-18", correctAnswers: 4, totalQuestions: 5 },
            { name: "Neutral Player", score: 289, date: "2025-02-15", correctAnswers: 3, totalQuestions: 5 }
          ]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard. Using default data.");
        // Set default leaderboard if there's an error
        setLeaderboard([
          { name: "History Buff", score: 482, date: "2025-02-20", correctAnswers: 5, totalQuestions: 5 },
          { name: "Expert", score: 375, date: "2025-02-18", correctAnswers: 4, totalQuestions: 5 },
          { name: "Neutral Player", score: 289, date: "2025-02-15", correctAnswers: 3, totalQuestions: 5 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [categoryId, gameId]);

  // Reset inputs when moving to a new question
  useEffect(() => {
    setLowerBound('');
    setUpperBound('');
    setConfidenceLevel(80);
    setInputError('');
  }, [currentQuestionIndex]);
  
  // Save score to Supabase leaderboard
  const saveToLeaderboard = async () => {
    if (!playerName.trim()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create new leaderboard entry with category and game info
      const newEntry = {
        name: playerName.trim(),
        score: score,
        date: new Date().toISOString(),
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalQuestions: questions.length,
        categoryId: categoryId,
        gameId: gameId
      };
      
      // Insert the new entry into Supabase
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([newEntry]);
        
      if (insertError) {
        throw insertError;
      }
      
      // Fetch the updated leaderboard for this specific game
      const { data, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('categoryId', categoryId)
        .eq('gameId', gameId)
        .order('score', { ascending: false })
        .limit(10);
        
      if (fetchError) {
        throw fetchError;
      }
      
      setLeaderboard(data);
      setGameStage('summary');
      
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      setError("Failed to save your score. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form for new question
  const resetForm = () => {
    setLowerBound('');
    setUpperBound('');
    setConfidenceLevel(80);
    setInputError('');
  };
  
  // Process user submission
  const handleSubmit = () => {
    // Clear any previous errors
    setInputError('');
    
    try {
      // Input validation
      if (!lowerBound || !upperBound) {
        setInputError('Please provide both lower and upper bounds');
        return;
      }
      
      const low = parseFloat(lowerBound);
      const high = parseFloat(upperBound);
      
      if (isNaN(low) || isNaN(high)) {
        setInputError('Please enter valid numbers');
        return;
      }
      
      if (low >= high) {
        setInputError('Upper bound must be greater than lower bound');
        return;
      }
      
      // Get question and actual answer
      const currentQuestion = questions[currentQuestionIndex];
      const actualValue = currentQuestion.answer;
      
      // Check if estimate is correct (actual value is within bounds)
      const isCorrect = low <= actualValue && actualValue <= high;
      
      // Calculate score
      let pointsEarned = 0;
      
      if (isCorrect) {
        // Calculate range width ratio
        const rangeWidth = high - low;
        const rangeRatio = rangeWidth / actualValue;
        
        // Base score for correct answers
        pointsEarned = 50;
        
        // Points based on range width
        if (rangeRatio < 0.1) { // Very narrow
          pointsEarned += 100;
        } else if (rangeRatio < 0.25) { // Fairly narrow
          pointsEarned += 75;
        } else if (rangeRatio < 0.5) { // Moderate
          pointsEarned += 50;
        } else if (rangeRatio < 1) { // Wide
          pointsEarned += 25;
        } else if (rangeRatio < 2) { // Very wide
          pointsEarned += 10;
        } else if (rangeRatio < 10) { // Extremely wide
          pointsEarned += 5;
        } else { // Ridiculously wide
          pointsEarned = 1;
        }
        
        // Adjust based on confidence
        if (confidenceLevel >= 90) {
          if (rangeRatio < 0.5) {
            // Bonus for high confidence with narrow range
            pointsEarned += 30;
          } else if (rangeRatio > 5) {
            // Penalty for high confidence with wide range
            pointsEarned -= 40;
            // Minimum 1 point for correct answer
            pointsEarned = Math.max(1, pointsEarned);
          }
        } else if (confidenceLevel >= 80) {
          if (rangeRatio < 0.5) {
            pointsEarned += 20;
          } else if (rangeRatio > 5) {
            pointsEarned -= 25;
            pointsEarned = Math.max(1, pointsEarned);
          }
        } else if (confidenceLevel >= 70) {
          if (rangeRatio < 0.5) {
            pointsEarned += 10;
          } else if (rangeRatio > 5) {
            pointsEarned -= 10;
            pointsEarned = Math.max(1, pointsEarned);
          }
        }
      } else {
        // Incorrect answer - penalty based on confidence
        if (confidenceLevel >= 90) {
          pointsEarned = -50;
        } else if (confidenceLevel >= 80) {
          pointsEarned = -30;
        } else if (confidenceLevel >= 70) {
          pointsEarned = -20;
        } else {
          pointsEarned = -10;
        }
        
        // Additional penalty based on how far off
        const closestBound = Math.abs(actualValue - low) < Math.abs(actualValue - high) ? low : high;
        const errorRatio = Math.abs(actualValue - closestBound) / actualValue;
        
        if (errorRatio > 2) { // Off by more than 200%
          pointsEarned -= 20;
        } else if (errorRatio > 1) { // Off by 100-200%
          pointsEarned -= 10;
        } else if (errorRatio > 0.5) { // Off by 50-100%
          pointsEarned -= 5;
        }
      }
      
      // Create answer record
      const answerRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        lowerBound: low,
        upperBound: high,
        confidenceLevel,
        actualValue,
        isCorrect,
        pointsEarned,
        unit: currentQuestion.unit
      };
      
      // Update game state
      setAnswers([...answers, answerRecord]);
      setScore(score + pointsEarned);
      setGameStage('feedback');
      
    } catch (error) {
      console.error("Error processing submission:", error);
      setInputError("An error occurred. Please try again.");
    }
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setGameStage('question');
      resetForm();
    } else {
      // End of game - prompt for leaderboard entry
      setGameStage('leaderboard-entry');
    }
  };
  
  // Restart the game
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setGameStage('question');
    setScore(0);
    setAnswers([]);
    setPlayerName('');
    resetForm();
    setError('');
  };
  
  // Render the question stage
  const renderQuestionStage = () => {
    if (!questions || questions.length === 0) {
      return (
        <div className="text-center p-4">
          <p>No questions available. Please go back and select another game.</p>
          <button 
            onClick={onBackToSelection}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Back to Game Selection
          </button>
        </div>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        
        <h2 className="text-xl font-bold mb-4">{currentQuestion.text}</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Lower Bound ({currentQuestion.unit})
              </label>
              <input 
                type="number" 
                value={lowerBound}
                onChange={(e) => setLowerBound(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter lower bound"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upper Bound ({currentQuestion.unit})
              </label>
              <input 
                type="number" 
                value={upperBound}
                onChange={(e) => setUpperBound(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter upper bound"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Confidence Level: {confidenceLevel}%
            </label>
            <input 
              type="range" 
              min="50" 
              max="99" 
              step="1"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50% (Less confident)</span>
              <span>99% (Very confident)</span>
            </div>
          </div>
          
          {inputError && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={16} />
              <span>{inputError}</span>
            </div>
          )}
          
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">How scoring works:</h3>
            <p className="text-sm text-gray-700">
              - Narrow, accurate ranges with high confidence earn the most points<br />
              - Extremely wide ranges (like "1 to 1,000,000") with high confidence can receive negative points<br />
              - Incorrect estimates always result in negative points based on confidence level<br />
              - The further off your estimate is, the more points you lose<br />
              - Balance precision with confidence for the highest score!
            </p>
          </div>
          
          <button 
            type="button" 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Submit Estimate
          </button>
        </div>
      </div>
    );
  };
  
  // Render the feedback stage
  const renderFeedbackStage = () => {
    if (answers.length === 0) {
      return <div>Loading feedback...</div>;
    }
    
    const currentAnswer = answers[answers.length - 1];
    const currentQuestion = questions.find(q => q.id === currentAnswer.questionId);
    
    if (!currentQuestion) {
      return <div>Question data not found</div>;
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            currentAnswer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {currentAnswer.isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
        </div>
        
        <h2 className="text-xl font-bold mb-4">{currentQuestion.text}</h2>
        
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500">Your estimate:</p>
              <p className="font-medium">{currentAnswer.lowerBound} - {currentAnswer.upperBound} {currentQuestion.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Confidence level:</p>
              <p className="font-medium">{currentAnswer.confidenceLevel}%</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Actual value:</p>
            <p className="font-bold text-lg">{currentAnswer.actualValue.toLocaleString()} {currentQuestion.unit}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Points earned:</p>
            <p className={`font-medium ${currentAnswer.pointsEarned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentAnswer.pointsEarned > 0 ? '+' : ''}{currentAnswer.pointsEarned}
            </p>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700">{currentQuestion.context}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="font-medium">Current score: {score} points</p>
        </div>
        
        <button 
          type="button"
          onClick={handleNextQuestion} 
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition cursor-pointer"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Final Results'}
        </button>
      </div>
    );
  };
  
  // Render the leaderboard entry stage
  const renderLeaderboardEntryStage = () => {
    // Calculate statistics
    const totalQuestions = questions.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Game Complete!</h2>
        
        <div className="bg-blue-50 p-6 rounded-md text-center">
          <p className="text-sm text-blue-600 uppercase font-semibold">Your Score</p>
          <p className="text-4xl font-bold my-2">{score} points</p>
          <p className="text-gray-600">
            You got {correctAnswers} out of {totalQuestions} questions correct ({accuracy.toFixed(1)}%)
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-3">Enter your name for the leaderboard:</h3>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            maxLength={20}
          />
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveToLeaderboard}
              disabled={!playerName.trim() || isLoading}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
                playerName.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Score'}
            </button>
            
            <button
              type="button"
              onClick={() => setGameStage('summary')}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the leaderboard
  const renderLeaderboard = () => {
    if (isLoading) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">Loading leaderboard...</p>
        </div>
      );
    }
    
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No scores yet. Be the first!</p>
        </div>
      );
    }
    
    // Find current player's entry if they saved their score
    const playerEntry = playerName ? leaderboard.find(entry => 
      entry.name === playerName && 
      entry.score === score &&
      (new Date(entry.date).toDateString() === new Date().toDateString())
    ) : null;
    
    return (
      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry, index) => {
              const isCurrentPlayer = playerEntry && 
                playerEntry.id === entry.id;
                
              return (
                <tr 
                  key={entry.id || index} 
                  className={isCurrentPlayer ? "bg-blue-50" : ""}
                >
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
                    {isCurrentPlayer && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    {entry.score}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {((entry.correctAnswers / entry.totalQuestions) * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render the summary stage
  const renderSummaryStage = () => {
    // Calculate statistics
    const totalQuestions = questions.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Game Summary</h2>
        
        <div className="bg-blue-50 p-6 rounded-md text-center">
          <p className="text-sm text-blue-600 uppercase font-semibold">Final Score</p>
          <p className="text-4xl font-bold my-2">{score} points</p>
          <p className="text-gray-600">
            You got {correctAnswers} out of {totalQuestions} questions correct ({accuracy.toFixed(1)}%)
          </p>
        </div>
        
        {/* Leaderboard section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center">
            <Trophy size={20} className="text-yellow-500 mr-2" />
            Leaderboard
          </h3>
          {renderLeaderboard()}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 mt-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        {/* Answers section */}
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-lg">Your Answers:</h3>
          
          {answers.map((answer, index) => {
            const question = questions.find(q => q.id === answer.questionId);
            
            return (
              <div key={index} className={`p-4 rounded-md ${
                answer.isCorrect ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'
              }`}>
                <p className="font-medium">{answer.question}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-500">Your estimate:</p>
                    <p>{answer.lowerBound} - {answer.upperBound} {answer.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Actual value:</p>
                    <p className="font-medium">{answer.actualValue.toLocaleString()} {answer.unit}</p>
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  <p className="text-gray-500">Points earned:</p>
                  <p className={`${answer.pointsEarned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.pointsEarned > 0 ? '+' : ''}{answer.pointsEarned}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={handleRestart} 
            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Play Again
          </button>
          
          <button 
            type="button"
            onClick={onBackToSelection} 
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition cursor-pointer"
          >
            Try Another Game
          </button>
        </div>
      </div>
    );
  };
  
  // Render current game stage
  const renderCurrentStage = () => {
    try {
      switch (gameStage) {
        case 'question':
          return renderQuestionStage();
        case 'feedback':
          return renderFeedbackStage();
        case 'leaderboard-entry':
          return renderLeaderboardEntryStage();
        case 'summary':
          return renderSummaryStage();
        default:
          return renderQuestionStage();
      }
    } catch (error) {
      console.error("Render error:", error);
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <h3 className="font-bold">Something went wrong</h3>
          <p>There was an error rendering the game. Please try refreshing the page.</p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleRestart}
              className="px-4 py-2 rounded-md bg-red-600 text-white"
            >
              Restart Game
            </button>
            <button 
              onClick={onBackToSelection}
              className="px-4 py-2 rounded-md bg-gray-600 text-white"
            >
              Back to Selection
            </button>
          </div>
        </div>
      );
    }
  };

  // Main render
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
        <h1 className="text-2xl font-bold mb-2">{gameName}</h1>
        <p className="text-gray-600">Test your knowledge with this estimation game</p>
      </header>
      
      <main className="bg-white shadow-md rounded-lg p-6">
        {renderCurrentStage()}
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Inspired by the Quantified Intuitions Estimation Game</p>
      </footer>
    </div>
  );
};

export default EstimationGame;
