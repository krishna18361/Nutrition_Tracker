import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { nutritionService } from '../services/api.service';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const NutritionCharts = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchMeals();
  }, [timeRange]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await nutritionService.getMeals();
      const mealsData = response.data || [];
      setMeals(mealsData);
      processChartData(mealsData);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (mealsData) => {
    // Process data for different chart types
    const caloriesByDay = processCaloriesByDay(mealsData);
    const macronutrientDistribution = processMacronutrientDistribution(mealsData);
    const mealTypeDistribution = processMealTypeDistribution(mealsData);

    setChartData({
      caloriesByDay,
      macronutrientDistribution,
      mealTypeDistribution
    });
  };

  const processCaloriesByDay = (meals) => {
    const caloriesData = {};
    meals.forEach(meal => {
      const date = new Date(meal.timestamp).toLocaleDateString();
      caloriesData[date] = (caloriesData[date] || 0) + (meal.nutritionInfo?.calories || 0);
    });

    return {
      labels: Object.keys(caloriesData),
      datasets: [{
        label: 'Daily Calories',
        data: Object.values(caloriesData),
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      }]
    };
  };

  const processMacronutrientDistribution = (meals) => {
    const totals = {
      protein: 0,
      carbs: 0,
      fat: 0
    };

    meals.forEach(meal => {
      totals.protein += meal.nutritionInfo?.protein_g || 0;
      totals.carbs += meal.nutritionInfo?.carbohydrates_total_g || 0;
      totals.fat += meal.nutritionInfo?.fat_total_g || 0;
    });

    return {
      labels: ['Protein', 'Carbohydrates', 'Fat'],
      datasets: [{
        data: [totals.protein, totals.carbs, totals.fat],
        backgroundColor: [
          '#1976D2',
          '#2196F3',
          '#90CAF9'
        ]
      }]
    };
  };

  const processMealTypeDistribution = (meals) => {
    const mealTypes = {};
    meals.forEach(meal => {
      const type = meal.mealType || 'Other';
      mealTypes[type] = (mealTypes[type] || 0) + (meal.nutritionInfo?.calories || 0);
    });

    return {
      labels: Object.keys(mealTypes),
      datasets: [{
        data: Object.values(mealTypes),
        backgroundColor: [
          '#1976D2',
          '#2196F3',
          '#90CAF9',
          '#E3F2FD'
        ]
      }]
    };
  };

  if (loading) {
    return <div className="nutrition-charts loading">Loading charts...</div>;
  }

  if (error) {
    return <div className="nutrition-charts error">{error}</div>;
  }

  return (
    <div className="nutrition-charts">
      <div className="charts-header">
        <h3>Nutrition Overview</h3>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-selector"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h4>Daily Calorie Intake</h4>
          <Line 
            data={chartData.caloriesByDay}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Calories Over Time'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Calories'
                  }
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h4>Macronutrient Distribution</h4>
          <Pie 
            data={chartData.macronutrientDistribution}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Protein, Carbs, and Fat Distribution'
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h4>Calories by Meal Type</h4>
          <Bar 
            data={chartData.mealTypeDistribution}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Calorie Distribution by Meal Type'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Calories'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NutritionCharts; 