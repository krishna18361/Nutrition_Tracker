import React, { useState, useEffect } from 'react';
import { getMealsByDateRange, getNutritionData, eventEmitter, EVENTS } from '../services/nutritionService';

// Daily requirements for nutrients
const DAILY_REQUIREMENTS = {
  protein_g: { name: 'Protein', min: 50, unit: 'g', foods: ['Lean meat', 'Fish', 'Eggs', 'Legumes'] },
  carbohydrates_total_g: { name: 'Carbohydrates', min: 275, unit: 'g', foods: ['Whole grains', 'Fruits', 'Vegetables'] },
  fat_total_g: { name: 'Fat', min: 44, unit: 'g', foods: ['Avocados', 'Nuts', 'Olive oil'] },
  fiber_g: { name: 'Fiber', min: 28, unit: 'g', foods: ['Vegetables', 'Fruits', 'Whole grains'] },
  calcium_mg: { name: 'Calcium', min: 1000, unit: 'mg', foods: ['Dairy', 'Leafy greens', 'Fortified foods'] },
  iron_mg: { name: 'Iron', min: 18, unit: 'mg', foods: ['Red meat', 'Leafy greens', 'Fortified cereals'] },
  potassium_mg: { name: 'Potassium', min: 3500, unit: 'mg', foods: ['Bananas', 'Potatoes', 'Spinach'] },
  sodium_mg: { name: 'Sodium', min: 2300, unit: 'mg', foods: ['Salt', 'Processed foods'] },
  vitamin_c_mg: { name: 'Vitamin C', min: 90, unit: 'mg', foods: ['Citrus fruits', 'Bell peppers', 'Broccoli'] },
  cholesterol_mg: { name: 'Cholesterol', min: 300, unit: 'mg', foods: ['Eggs', 'Shellfish', 'Organ meats'] },
  sugar_g: { name: 'Sugar', min: 30, unit: 'g', foods: ['Fruits', 'Dairy', 'Sweet foods'] },
  saturated_fat_g: { name: 'Saturated Fat', min: 20, unit: 'g', foods: ['Butter', 'Cheese', 'Fatty meats'] }
};

// Score range definitions - fixed quotes for apostrophes
const SCORE_RANGES = [
  { min: 90, max: 100, label: 'Excellent', description: 'Your nutrition is excellent! You\'re meeting or exceeding most nutrient requirements.' },
  { min: 80, max: 89, label: 'Very Good', description: 'Your nutrition is very good. You\'re meeting most nutrient requirements with some room for improvement.' },
  { min: 70, max: 79, label: 'Good', description: 'Your nutrition is good. You\'re meeting many nutrient requirements but have some areas to focus on.' },
  { min: 60, max: 69, label: 'Fair', description: 'Your nutrition is fair. You\'re meeting some nutrient requirements but have several areas that need attention.' },
  { min: 50, max: 59, label: 'Below Average', description: 'Your nutrition is below average. You\'re missing several important nutrients.' },
  { min: 0, max: 49, label: 'Needs Improvement', description: 'Your nutrition needs significant improvement. You\'re missing many important nutrients.' }
];

const TIME_PERIODS = [
  { value: 'today', label: 'Today', days: 1 },
  { value: 'week', label: 'Past 7 Days', days: 7 },
  { value: 'month', label: 'Past 30 Days', days: 30 }
];

const NutritionAnalysis = () => {
  const [nutrients, setNutrients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nutritionStrengths, setNutritionStrengths] = useState([]);
  const [nutritionWeaknesses, setNutritionWeaknesses] = useState([]);
  const [overallBalance, setOverallBalance] = useState(0);
  const [timePeriod, setTimePeriod] = useState('week'); // Default to week
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger data refresh

  // Subscribe to meal events
  useEffect(() => {
    // Set up event subscriptions
    const mealAddedUnsubscribe = eventEmitter.subscribe(EVENTS.MEAL_ADDED, () => {
      console.log('NutritionAnalysis: Meal added event received');
      // Force refresh by incrementing the refreshTrigger
      setRefreshTrigger(prev => prev + 1);
    });
    
    const mealUpdatedUnsubscribe = eventEmitter.subscribe(EVENTS.MEAL_UPDATED, () => {
      console.log('NutritionAnalysis: Meal updated event received');
      setRefreshTrigger(prev => prev + 1);
    });
    
    const mealDeletedUnsubscribe = eventEmitter.subscribe(EVENTS.MEAL_DELETED, () => {
      console.log('NutritionAnalysis: Meal deleted event received');
      setRefreshTrigger(prev => prev + 1);
    });
    
    // Clean up subscriptions on component unmount
    return () => {
      mealAddedUnsubscribe();
      mealUpdatedUnsubscribe();
      mealDeletedUnsubscribe();
    };
  }, []);

  // Fetch data when time period changes or refresh is triggered
  useEffect(() => {
    fetchNutrientData(timePeriod);
  }, [timePeriod, refreshTrigger]);

  const fetchNutrientData = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range based on selected period
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      // Set days based on selected period
      const periodConfig = TIME_PERIODS.find(p => p.value === period) || TIME_PERIODS[1]; // Default to week
      startDate.setDate(startDate.getDate() - (periodConfig.days - 1)); // Subtract days - 1 to include today
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      console.log(`Fetching nutrition data from ${formattedStartDate} to ${endDate}`);
      
      // Fetch meals from API for the selected period
      let mealsData;
      try {
        mealsData = await getMealsByDateRange(formattedStartDate, endDate);
      } catch (apiError) {
        console.error('Error with meal API, using fallback:', apiError);
        // If the API fails, try to get all meals and filter by date manually
        const allMeals = await nutritionService.getAllMeals();
        if (allMeals && allMeals.data) {
          mealsData = Array.isArray(allMeals.data) ? allMeals.data : [];
          // Filter meals within the date range
          mealsData = mealsData.filter(meal => {
            const mealDate = new Date(meal.date).toISOString().split('T')[0];
            return mealDate >= formattedStartDate && mealDate <= endDate;
          });
        }
      }
      
      if (mealsData && mealsData.length > 0) {
        processNutrientData(mealsData, periodConfig.days);
      } else {
        setNutrients([]);
        setNutritionStrengths([]);
        setNutritionWeaknesses([]);
        setOverallBalance(0);
      }
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('Failed to load nutrition data. Please try again later.');
      
      // Display demo data even if there's an error
      try {
        const demoMeals = generateDemoMeals();
        processNutrientData(demoMeals, TIME_PERIODS.find(p => p.value === period).days);
        setError(null); // Clear error if demo data works
      } catch (demoErr) {
        console.error('Error generating demo data:', demoErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to generate demo meals for fallback
  const generateDemoMeals = () => {
    return [
      {
        _id: 'demo1',
        name: 'Demo Breakfast',
        date: new Date().toISOString().split('T')[0],
        nutritionInfo: {
          calories: 450,
          protein_g: 15,
          carbohydrates_total_g: 45,
          fat_total_g: 20,
          fiber_g: 5,
          calcium_mg: 300,
          iron_mg: 2,
          potassium_mg: 400,
          sodium_mg: 500,
          vitamin_c_mg: 30,
          cholesterol_mg: 150,
          sugar_g: 10,
          saturated_fat_g: 5
        }
      },
      {
        _id: 'demo2',
        name: 'Demo Lunch',
        date: new Date().toISOString().split('T')[0],
        nutritionInfo: {
          calories: 650,
          protein_g: 30,
          carbohydrates_total_g: 70,
          fat_total_g: 25,
          fiber_g: 8,
          calcium_mg: 250,
          iron_mg: 4,
          potassium_mg: 700,
          sodium_mg: 800,
          vitamin_c_mg: 45,
          cholesterol_mg: 180,
          sugar_g: 15,
          saturated_fat_g: 7
        }
      },
      {
        _id: 'demo3',
        name: 'Demo Dinner',
        date: new Date().toISOString().split('T')[0],
        nutritionInfo: {
          calories: 550,
          protein_g: 35,
          carbohydrates_total_g: 50,
          fat_total_g: 20,
          fiber_g: 10,
          calcium_mg: 350,
          iron_mg: 5,
          potassium_mg: 800,
          sodium_mg: 600,
          vitamin_c_mg: 60,
          cholesterol_mg: 120,
          sugar_g: 8,
          saturated_fat_g: 4
        }
      }
    ];
  };

  const processNutrientData = (meals, days) => {
    try {
      // Calculate nutrient totals
      const nutrientTotals = {};
      
      meals.forEach(meal => {
        if (meal && meal.nutritionInfo) {
          Object.entries(meal.nutritionInfo).forEach(([key, value]) => {
            if (!nutrientTotals[key]) {
              nutrientTotals[key] = 0;
            }
            // Make sure the value is a number
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            nutrientTotals[key] += numValue;
          });
        }
      });

      // Calculate daily averages for the selected period
      const dailyAverages = {};
      Object.entries(nutrientTotals).forEach(([key, total]) => {
        dailyAverages[key] = total / days;
      });

      // Calculate percentages of recommended values
      const nutrientsMap = {};
      Object.entries(dailyAverages).forEach(([key, average]) => {
        const requirement = DAILY_REQUIREMENTS[key];
        if (requirement) {
          nutrientsMap[key] = {
            dailyAverage: average,
            percentOfRecommended: (average / requirement.min) * 100
          };
        }
      });

      const nutrientsList = [];
      let totalScore = 0;
      let nutrientCount = 0;

      // Process each nutrient
      Object.entries(nutrientsMap).forEach(([key, value]) => {
        const requirement = DAILY_REQUIREMENTS[key];
        if (!requirement) return;

        const percent = value.percentOfRecommended;
        let status = 'optimal';
        let statusText = 'Optimal';

        if (percent < 50) {
          status = 'severe-deficiency';
          statusText = 'Severe Deficiency';
        } else if (percent < 70) {
          status = 'moderate-deficiency';
          statusText = 'Moderate Deficiency';
        } else if (percent < 90) {
          status = 'mild-deficiency';
          statusText = 'Mild Deficiency';
        } else if (percent > 110) {
          status = 'excess';
          statusText = 'Excess';
        }

        const nutrientData = {
          key,
          name: requirement.name,
          average: value.dailyAverage.toFixed(1),
          unit: requirement.unit,
          recommended: requirement.min,
          percent: Math.round(percent),
          foods: requirement.foods,
          status,
          statusText
        };

        nutrientsList.push(nutrientData);
        totalScore += Math.min(percent, 100); // Cap percent at 100 for score calculation
        nutrientCount++;
      });

      // Sort nutrients by percentage
      nutrientsList.sort((a, b) => b.percent - a.percent);

      // Calculate overall balance score
      const balanceScore = nutrientCount > 0 ? Math.round(totalScore / nutrientCount) : 0;
      setOverallBalance(Math.min(balanceScore, 100)); // Cap overall score at 100

      // Separate strengths and weaknesses
      const strengths = nutrientsList.filter(n => n.status === 'optimal');
      const weaknesses = nutrientsList.filter(n => n.status !== 'optimal');

      setNutritionStrengths(strengths);
      setNutritionWeaknesses(weaknesses);
      setNutrients(nutrientsList);
    } catch (err) {
      console.error('Error processing nutrient data:', err);
      setError('Error processing nutrition data. Please try again later.');
    }
  };

  const getHealthScoreColor = (score) => {
    if (score < 60) return '#2196F3'; // Blue for low scores
    if (score < 80) return '#64B5F6'; // Light blue for medium scores
    return '#4CAF50'; // Keep green for high scores
  };

  const getNutrientStatusClass = (status) => {
    return `status-${status}`;
  };

  const getNutrientStatusColor = (status) => {
    switch (status) {
      case 'severe-deficiency':
        return '#2196F3'; // Blue
      case 'moderate-deficiency':
        return '#64B5F6'; // Light blue
      case 'mild-deficiency':
        return '#90CAF9'; // Lighter blue
      case 'excess':
        return '#1976D2'; // Dark blue
      case 'optimal':
        return '#4CAF50'; // Keep green for optimal
      default:
        return '#2196F3'; // Default blue
    }
  };

  const getScoreRange = (score) => {
    return SCORE_RANGES.find(range => score >= range.min && score <= range.max) || SCORE_RANGES[SCORE_RANGES.length - 1];
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  // Force refresh button handler
  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div className="loading">Loading nutrition analysis...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (nutrients.length === 0) {
    return (
      <div className="nutrition-analysis">
        <div className="time-period-selector">
          <label htmlFor="time-period">Time Period: </label>
          <select 
            id="time-period" 
            value={timePeriod} 
            onChange={handleTimePeriodChange}
            className="time-period-select"
          >
            {TIME_PERIODS.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button onClick={handleManualRefresh} className="refresh-button">
            <span role="img" aria-label="refresh">🔄</span> Refresh
          </button>
        </div>
        <div className="empty-message">
          <h3>No nutrition data available</h3>
          <p>Start tracking your meals to see your nutrition analysis.</p>
        </div>
      </div>
    );
  }

  const scoreRange = getScoreRange(overallBalance);
  const currentPeriod = TIME_PERIODS.find(p => p.value === timePeriod);

  return (
    <div className="nutrition-analysis">
      <div className="time-period-selector">
        <label htmlFor="time-period">Time Period: </label>
        <select 
          id="time-period" 
          value={timePeriod} 
          onChange={handleTimePeriodChange}
          className="time-period-select"
        >
          {TIME_PERIODS.map(period => (
            <option key={period.value} value={period.value}>{period.label}</option>
          ))}
        </select>
        <button onClick={handleManualRefresh} className="refresh-button">
          <span role="img" aria-label="refresh">🔄</span> Refresh
        </button>
      </div>

      <div className="nutrition-overview">
        <div className="health-score">
          <h3>Overall Nutrition Score</h3>
          <div className="score-value" style={{ color: getHealthScoreColor(overallBalance) }}>
            {overallBalance}
          </div>
          <p className="score-label">{scoreRange.label}</p>
          <p className="score-description">{scoreRange.description}</p>
          
          <div className="score-ranges">
            <h4>Score Ranges:</h4>
            <ul>
              {SCORE_RANGES.map((range, index) => (
                <li key={index} className={overallBalance >= range.min && overallBalance <= range.max ? 'active' : ''}>
                  <span className="range-label">{range.label}:</span> {range.min}-{range.max}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="analysis-summary">
          <div>
            <h4>Nutrition Strengths</h4>
            {nutritionStrengths.length > 0 ? (
              <ul className="strengths-list">
                {nutritionStrengths.map((nutrient, index) => (
                  <li key={index} style={{ borderLeft: `4px solid ${getNutrientStatusColor(nutrient.status)}` }}>
                    <span className="nutrient-name">{nutrient.name}</span>
                    {nutrient.percent}% of recommended
                  </li>
                ))}
              </ul>
            ) : (
              <p>No nutrition strengths identified yet.</p>
            )}
          </div>
          
          <div>
            <h4>Areas for Improvement</h4>
            {nutritionWeaknesses.length > 0 ? (
              <ul className="weaknesses-list">
                {nutritionWeaknesses.map((nutrient, index) => (
                  <li key={index} style={{ borderLeft: `4px solid ${getNutrientStatusColor(nutrient.status)}` }}>
                    <span className="nutrient-name">{nutrient.name}</span>
                    {nutrient.percent}% of recommended
                    <div className="food-suggestions">
                      Try: {nutrient.foods.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No areas for improvement identified.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="detailed-analysis">
        <h3>Detailed Nutrition Analysis ({currentPeriod.label})</h3>
        <div className="nutrient-row header">
          <div className="nutrient-cell">Nutrient</div>
          <div className="nutrient-cell">Daily Avg</div>
          <div className="nutrient-cell">Recommended</div>
          <div className="nutrient-cell">Status</div>
          <div className="nutrient-cell">%</div>
        </div>
        
        {nutrients.map((nutrient, index) => (
          <div className="nutrient-row" key={index}>
            <div className="nutrient-cell">{nutrient.name}</div>
            <div className="nutrient-cell">
              {nutrient.average} {nutrient.unit}
            </div>
            <div className="nutrient-cell">
              {nutrient.recommended} {nutrient.unit}
            </div>
            <div className="nutrient-cell">
              <span className={getNutrientStatusClass(nutrient.status)}>
                {nutrient.statusText}
              </span>
            </div>
            <div className="nutrient-cell percent">
              <div className="percent-bar-container">
                <div
                  className="percent-bar"
                  style={{
                    width: `${Math.min(nutrient.percent, 100)}%`,
                    backgroundColor: getNutrientStatusColor(nutrient.status),
                  }}
                ></div>
              </div>
              <span>{nutrient.percent}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="analysis-tips">
        <h3>Nutrition Tips</h3>
        <ul>
          <li>This analysis is based on your meal entries from {currentPeriod.label.toLowerCase()}.</li>
          <li>Aim for a balanced diet that meets all nutrient requirements.</li>
          <li>Consider focusing on the nutrients in your "Areas for Improvement" section.</li>
          <li>Your Overall Nutrition Score represents how well you're meeting your daily nutrient requirements.</li>
          <li>Remember that good nutrition is about consistency over time.</li>
        </ul>
      </div>
    </div>
  );
};

export default NutritionAnalysis; 