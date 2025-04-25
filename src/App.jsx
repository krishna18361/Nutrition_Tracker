import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import NutritionForm from './components/NutritionForm';
import NutritionInfo from './components/NutritionInfo';
import History from './components/History';
import HomePage from './components/HomePage';
import WaterIntake from './components/WaterIntake';
import NutritionDeficiencyAlert from './components/NutritionDeficiencyAlert';
import NutritionReports from './components/NutritionReports';
import NutritionCharts from './components/NutritionCharts';
import BMICalculator from './components/BMICalculator';
import NutritionAnalysis from './components/NutritionAnalysis';
import StreakCounter from './components/StreakCounter';
import SeasonalFoods from './components/SeasonalFoods';
import { authService, nutritionService, handleApiError } from './services/api.service';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Simple inline logo SVG
const logoSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20"></path>
    <path d="M12 16V4M6 12h12"></path>
    <path d="M12 8v8"></path>
  </svg>
);

const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  MORNING_SNACK: 'Morning Snack',
  LUNCH: 'Lunch',
  AFTERNOON_SNACK: 'Afternoon Snack',
  DINNER: 'Dinner',
  EVENING_SNACK: 'Evening Snack'
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') ? true : false);
  const [nutrition, setNutrition] = useState(null);
  const [error, setError] = useState(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [mealCalories, setMealCalories] = useState({
    [MEAL_TYPES.BREAKFAST]: 0,
    [MEAL_TYPES.MORNING_SNACK]: 0,
    [MEAL_TYPES.LUNCH]: 0,
    [MEAL_TYPES.AFTERNOON_SNACK]: 0,
    [MEAL_TYPES.DINNER]: 0,
    [MEAL_TYPES.EVENING_SNACK]: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch user's nutrition stats from backend
  useEffect(() => {
    if (isLoggedIn) {
      fetchNutritionStats();
    }
  }, [isLoggedIn]);

  const fetchNutritionStats = async () => {
    try {
      const response = await nutritionService.getNutritionStats();
      console.log('Nutrition stats in App:', response);
      
      if (response && response.success) {
        const stats = response.data;
        setDailyCalories(stats.totalCalories || 0);
        setCalorieGoal(stats.calorieGoal || 2000);
        setMealCalories(stats.mealBreakdown || {
          [MEAL_TYPES.BREAKFAST]: 0,
          [MEAL_TYPES.MORNING_SNACK]: 0,
          [MEAL_TYPES.LUNCH]: 0,
          [MEAL_TYPES.AFTERNOON_SNACK]: 0,
          [MEAL_TYPES.DINNER]: 0,
          [MEAL_TYPES.EVENING_SNACK]: 0
        });
      } else {
        console.error('Failed to fetch nutrition stats:', response);
        setDailyCalories(0);
        setCalorieGoal(2000);
        setMealCalories({
          [MEAL_TYPES.BREAKFAST]: 0,
          [MEAL_TYPES.MORNING_SNACK]: 0,
          [MEAL_TYPES.LUNCH]: 0,
          [MEAL_TYPES.AFTERNOON_SNACK]: 0,
          [MEAL_TYPES.DINNER]: 0,
          [MEAL_TYPES.EVENING_SNACK]: 0
        });
      }
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      setDailyCalories(0);
      setCalorieGoal(2000);
      setMealCalories({
        [MEAL_TYPES.BREAKFAST]: 0,
        [MEAL_TYPES.MORNING_SNACK]: 0,
        [MEAL_TYPES.LUNCH]: 0,
        [MEAL_TYPES.AFTERNOON_SNACK]: 0,
        [MEAL_TYPES.DINNER]: 0,
        [MEAL_TYPES.EVENING_SNACK]: 0
      });
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await authService.login(credentials);
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token saved to localStorage');
        
        // Force a page refresh to ensure state is reset
        window.location.href = '/';
        return;
      } else {
        throw new Error('Invalid response from server - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Improved error handling with specific messages
      let errorMessage;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Login request timed out. Please try again later.';
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Server is taking too long to respond. Please try again.';
      } else if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 'Login failed. Please check your credentials.';
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Other errors
        errorMessage = error.message || 'Login failed';
      }
      
      setError(errorMessage);
      // Clear any existing token to prevent issues
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  const handleSearch = async (dishName, quantity) => {
    const apiKey = 'DJ0KU6mfzdux6Di0nyk00Q==nnlqZpvlF5ZrrelP'; // Replace with your CalorieNinjas API Key

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(quantity + ' ' + dishName)}`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const food = data.items[0];
        const nutritionData = {
          name: food.name,
          calories: food.calories || 0,
          carbohydrates_total_g: food.carbohydrates_total_g || 0,
          cholesterol_mg: food.cholesterol_mg || 0,
          fat_saturated_g: food.fat_saturated_g || 0,
          fat_total_g: food.fat_total_g || 0,
          fiber_g: food.fiber_g || 0,
          potassium_mg: food.potassium_mg || 0,
          protein_g: food.protein_g || 0,
          serving_size_g: food.serving_size_g || 0,
          sodium_mg: food.sodium_mg || 0,
          sugar_g: food.sugar_g || 0,
        };
        setNutrition(nutritionData);
        setError(null);
        
        // Refresh nutrition stats after adding a meal
        fetchNutritionStats();
        
        return nutritionData;
      } else {
        setError('No nutrition data found for the entered dish');
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handler for calorie goal updates
  const handleCalorieGoalChange = async (e) => {
    const newGoal = parseInt(e.target.value) || 0;
    setCalorieGoal(newGoal);
    
    try {
      // Update calorie goal on the backend
      await nutritionService.updateProfile({ calorieGoal: newGoal });
    } catch (error) {
      console.error('Error updating calorie goal:', error);
    }
  };

  return (
    <Router>
      <div className="app">
        <header>
          <div className="logo">
            {logoSvg}
            <h1>NuTrack</h1>
          </div>
          <nav>
            <ul>
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
              </li>
              <li>
                <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link>
              </li>
              <li>
                <Link to="/analysis" className={location.pathname === '/analysis' ? 'active' : ''}>Nutrition Analysis</Link>
              </li>
              <li>
                <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>Reports</Link>
              </li>
              <li>
                <Link to="/bmi" className={location.pathname === '/bmi' ? 'active' : ''}>BMI Calculator</Link>
              </li>
              <li>
                <Link to="/seasonal" className={location.pathname === '/seasonal' ? 'active' : ''}>Seasonal Foods</Link>
              </li>
            </ul>
          </nav>
        </header>

        <div className="content">
          <Routes>
            <Route path="/" element={
              <>
                {!isLoggedIn ? (
                  // Login and Homepage View
                  <div className="flex-item" style={{ maxWidth: '800px' }}>
                    <HomePage />
                    <LoginPage onLogin={handleLogin} error={error} />
                  </div>
                ) : (
                  // Main App View
                  <div style={{ width: '100%', maxWidth: '1200px' }}>
                    <header style={{ textAlign: 'center', margin: '0 0 2rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#222' }}>
                        NU<span style={{ color: '#444' }}>TRACK</span>
                      </h1>
                      <button 
                        onClick={handleLogout}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#777', 
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Logout
                      </button>
                    </header>
                    
                    {/* Daily Calorie Summary */}
                    <div className="calorie-summary card-hover">
                      <div className="calorie-header">
                        <h2>Daily Calorie Intake</h2>
                        <div className="calorie-goal-setter">
                          <label htmlFor="calorie-goal">Daily Goal:</label>
                          <input 
                            id="calorie-goal"
                            type="number" 
                            min="0"
                            value={calorieGoal} 
                            onChange={handleCalorieGoalChange}
                            style={{ 
                              width: '100px', 
                              marginLeft: '10px',
                              marginBottom: '0',
                              padding: '0.5rem'
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="calorie-stats">
                        <div className="calorie-stat">
                          <span>Consumed</span>
                          <span className="calorie-value">{dailyCalories.toFixed(0)}</span>
                        </div>
                        <div className="calorie-stat">
                          <span>Remaining</span>
                          <span className="calorie-value">{Math.max(0, calorieGoal - dailyCalories).toFixed(0)}</span>
                        </div>
                        <div className="calorie-stat">
                          <span>Goal</span>
                          <span className="calorie-value">{calorieGoal}</span>
                        </div>
                      </div>
                      
                      <div className="progress-container" style={{ height: '12px', marginTop: '1rem' }}>
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${Math.min(100, (dailyCalories / calorieGoal) * 100)}%`,
                            height: '12px',
                            backgroundColor: dailyCalories > calorieGoal ? '#a33' : '#333'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="app-grid">
                      <div className="left-column">
                        <div className="section-header">
                          <h2>Track Your Nutrition</h2>
                        </div>
                        
                        <div className="meal-section">
                          <NutritionForm onSearch={handleSearch} />
                          
                          {nutrition && (
                            <NutritionInfo nutrition={nutrition} />
                          )}
                          
                          {error && (
                            <div style={{ color: 'red', margin: '1rem 0', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                              {error}
                            </div>
                          )}
                        </div>
                        
                        <WaterIntake />
                      </div>
                      
                      <div className="right-column">
                        <div className="section-header">
                          <h2>Your Progress</h2>
                        </div>
                        
                        <History />
                        <NutritionDeficiencyAlert />
                        <StreakCounter />
                        <SeasonalFoods />
                      </div>
                    </div>
                  </div>
                )}
              </>
            } />
            <Route path="/history" element={<History />} />
            <Route path="/analysis" element={<NutritionAnalysis />} />
            <Route path="/reports" element={<NutritionReports />} />
            <Route path="/bmi" element={<BMICalculator updateCalorieGoal={handleCalorieGoalChange} />} />
            <Route path="/nutrition-charts" element={<NutritionCharts />} />
            <Route path="/seasonal" element={<SeasonalFoods />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Helper function to get meal icons
function getMealIcon(mealType) {
  switch(mealType) {
    case MEAL_TYPES.BREAKFAST:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V8M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case MEAL_TYPES.MORNING_SNACK:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 6H19M5 10H19M5 14H11M5 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case MEAL_TYPES.LUNCH:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 10H5C4.44772 10 4 10.4477 4 11V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V11C20 10.4477 19.5523 10 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10V6M16 10V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case MEAL_TYPES.AFTERNOON_SNACK:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case MEAL_TYPES.DINNER:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6.5V8.5M8 12.5V14.5M8 18.5V20.5M12 4V6M12 10V12M12 16V18M12 22V20M16 6.5V8.5M16 12.5V14.5M16 18.5V20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case MEAL_TYPES.EVENING_SNACK:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11C14.7614 11 17 8.76142 17 6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6C7 8.76142 9.23858 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 21C19 17.134 15.866 14 12 14C8.13401 14 5 17.134 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default App;