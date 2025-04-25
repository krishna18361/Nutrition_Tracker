import React, { useState, useEffect } from 'react';
import { getStreak, updateStreak } from '../services/streakService';
import { nutritionService } from '../services/api.service';

const StreakCounter = () => {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [goalMet, setGoalMet] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, []);

  // Check if daily nutrition goals are met
  useEffect(() => {
    const checkNutritionGoals = async () => {
      try {
        const response = await nutritionService.getNutritionStats();
        
        if (response && response.success) {
          const stats = response.data;
          const calorieGoal = stats.calorieGoal || 2000;
          const dailyCalories = stats.totalCalories || 0;
          
          // Simple goal: if user has consumed at least 70% of their calorie goal
          // This can be enhanced with more sophisticated nutrition goal checks
          const isGoalMet = dailyCalories >= (calorieGoal * 0.7);
          
          setGoalMet(isGoalMet);
          
          // If goal is met today, update streak
          const today = new Date().toISOString().split('T')[0];
          if (isGoalMet && (!streak.lastUpdated || streak.lastUpdated !== today)) {
            const updatedStreak = await updateStreak();
            setStreak(updatedStreak);
            
            // Show animation if streak increased
            if (updatedStreak.currentStreak > streak.currentStreak) {
              setShowAnimation(true);
              setTimeout(() => setShowAnimation(false), 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking nutrition goals:', error);
      }
    };
    
    if (!loading) {
      checkNutritionGoals();
    }
  }, [loading, streak]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const streakData = await getStreak();
      setStreak(streakData);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="streak-counter-skeleton"></div>;
  }

  return (
    <div className={`streak-counter ${showAnimation ? 'streak-increased' : ''}`}>
      <div className="streak-header">
        <h3>Nutrition Streak</h3>
        <div className="streak-flame">
          {[...Array(Math.min(5, streak.currentStreak))].map((_, index) => (
            <span key={index} className="flame-icon" role="img" aria-label="flame">
              🔥
            </span>
          ))}
        </div>
      </div>
      
      <div className="streak-value">
        <span className="current-streak">{streak.currentStreak}</span>
        <span className="streak-label">days</span>
      </div>
      
      <div className="streak-details">
        <div className="streak-stat">
          <span className="stat-label">Longest Streak:</span>
          <span className="stat-value">{streak.longestStreak} days</span>
        </div>
        
        <div className="streak-status">
          <div className={`status-indicator ${goalMet ? 'goal-met' : 'goal-pending'}`}></div>
          <span className="status-text">
            {goalMet ? "Today's goal met! 🎉" : "Complete today's goal!"}
          </span>
        </div>
      </div>
      
      <div className="streak-tip">
        <p>Keep eating balanced meals to maintain your streak!</p>
      </div>
    </div>
  );
};

export default StreakCounter; 