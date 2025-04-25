import React, { useState, useEffect } from 'react';
import { nutritionService } from '../services/api.service';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const NUTRIENTS = {
  calories: { label: 'Calories', unit: 'kcal', color: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgb(255, 99, 132)' },
  protein_g: { label: 'Protein', unit: 'g', color: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgb(54, 162, 235)' },
  carbohydrates_total_g: { label: 'Carbs', unit: 'g', color: 'rgba(255, 206, 86, 0.6)', borderColor: 'rgb(255, 206, 86)' },
  fat_total_g: { label: 'Fat', unit: 'g', color: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgb(75, 192, 192)' },
  fiber_g: { label: 'Fiber', unit: 'g', color: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgb(153, 102, 255)' },
  sodium_mg: { label: 'Sodium', unit: 'mg', color: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgb(255, 159, 64)' }
};

const TIME_PERIODS = {
  WEEK: { label: 'Last 7 Days', value: 'week', days: 7 },
  MONTH: { label: 'Last 30 Days', value: 'month', days: 30 },
  THREE_MONTHS: { label: 'Last 3 Months', value: 'threeMonths', days: 90 }
};

const REPORT_TYPES = {
  TRENDS: 'trends',
  DISTRIBUTION: 'distribution',
  NUTRIENT_BREAKDOWN: 'nutrientBreakdown'
};

const NutritionReports = () => {
  const [timeRange, setTimeRange] = useState(TIME_PERIODS.WEEK.value);
  const [reportType, setReportType] = useState(REPORT_TYPES.TRENDS);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedNutrients, setSelectedNutrients] = useState(['calories', 'protein_g', 'carbohydrates_total_g', 'fat_total_g']);

  useEffect(() => {
    fetchMealData();
  }, [timeRange]);

  useEffect(() => {
    if (meals.length > 0) {
      generateChartData();
    }
  }, [meals, reportType, selectedNutrients]);

  const fetchMealData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === TIME_PERIODS.WEEK.value) {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === TIME_PERIODS.MONTH.value) {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === TIME_PERIODS.THREE_MONTHS.value) {
        startDate.setDate(startDate.getDate() - 90);
      }
      
      // Format dates as YYYY-MM-DD
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Get meal data
      const response = await nutritionService.getMealsByDateRange(formattedStartDate, formattedEndDate);
      setMeals(Array.isArray(response) ? response : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching meal data:', error);
      setError('Failed to load nutrition data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (reportType === REPORT_TYPES.TRENDS) {
      generateTrendsData();
    } else if (reportType === REPORT_TYPES.DISTRIBUTION) {
      generateDistributionData();
    } else if (reportType === REPORT_TYPES.NUTRIENT_BREAKDOWN) {
      generateNutrientBreakdownData();
    }
  };

  const generateTrendsData = () => {
    // Group meals by date and calculate daily totals
    const dailyData = {};
    
    meals.forEach(meal => {
      const date = new Date(meal.timestamp).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {};
        Object.keys(NUTRIENTS).forEach(nutrient => {
          dailyData[date][nutrient] = 0;
        });
      }
      
      // Sum up nutrients
      Object.keys(NUTRIENTS).forEach(nutrient => {
        if (meal.nutritionInfo && meal.nutritionInfo[nutrient] !== undefined) {
          dailyData[date][nutrient] += meal.nutritionInfo[nutrient];
        }
      });
    });
    
    // Sort dates
    const sortedDates = Object.keys(dailyData).sort();
    
    // Format chart data
    const data = {
      labels: sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: selectedNutrients.map(nutrient => ({
        label: `${NUTRIENTS[nutrient].label} (${NUTRIENTS[nutrient].unit})`,
        data: sortedDates.map(date => dailyData[date][nutrient]),
        borderColor: NUTRIENTS[nutrient].borderColor,
        backgroundColor: NUTRIENTS[nutrient].color,
        tension: 0.1
      }))
    };
    
    setChartData(data);
  };

  const generateDistributionData = () => {
    // Calculate total calories per meal type
    const mealTypeData = {
      'Breakfast': 0,
      'Morning Snack': 0,
      'Lunch': 0,
      'Afternoon Snack': 0,
      'Dinner': 0,
      'Evening Snack': 0,
      'Other': 0
    };
    
    // Debug log to check meals data
    console.log('Meals for distribution chart:', meals);
    
    meals.forEach(meal => {
      if (meal.nutritionInfo && meal.nutritionInfo.calories) {
        // Make sure we're using the correct meal type
        const type = meal.mealType || 'Other';
        console.log(`Meal: ${meal.name}, Type: ${type}, Calories: ${meal.nutritionInfo.calories}`);
        
        if (mealTypeData.hasOwnProperty(type)) {
          mealTypeData[type] += meal.nutritionInfo.calories;
        } else {
          mealTypeData['Other'] += meal.nutritionInfo.calories;
        }
      }
    });
    
    // Log the final data to verify
    console.log('Processed meal type data:', mealTypeData);
    
    // Filter out meal types with 0 calories to show only relevant data
    const filteredMealTypes = Object.keys(mealTypeData).filter(type => mealTypeData[type] > 0);
    const filteredData = filteredMealTypes.reduce((acc, type) => {
      acc[type] = mealTypeData[type];
      return acc;
    }, {});
    
    console.log('Filtered meal data for chart:', filteredData);
    
    const data = {
      labels: Object.keys(filteredData),
      datasets: [{
        label: 'Calories by Meal Type',
        data: Object.values(filteredData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    };
    
    setChartData(data);
  };

  const generateNutrientBreakdownData = () => {
    // Calculate total nutrients
    const totals = {};
    const nutrientBreakdown = {};
    
    // Initialize with zeros
    selectedNutrients.forEach(nutrient => {
      totals[nutrient] = 0;
    });
    
    // Sum nutrients from all meals
    meals.forEach(meal => {
      selectedNutrients.forEach(nutrient => {
        if (meal.nutritionInfo && meal.nutritionInfo[nutrient] !== undefined) {
          totals[nutrient] += meal.nutritionInfo[nutrient];
        }
      });
    });
    
    // Format data for pie chart
    const data = {
      labels: selectedNutrients.map(nutrient => `${NUTRIENTS[nutrient].label} (${NUTRIENTS[nutrient].unit})`),
      datasets: [{
        label: 'Nutrient Breakdown',
        data: selectedNutrients.map(nutrient => totals[nutrient]),
        backgroundColor: selectedNutrients.map(nutrient => NUTRIENTS[nutrient].color),
        borderColor: selectedNutrients.map(nutrient => NUTRIENTS[nutrient].borderColor),
        borderWidth: 1
      }]
    };
    
    setChartData(data);
  };

  const handleNutrientToggle = (nutrient) => {
    setSelectedNutrients(prev => {
      if (prev.includes(nutrient)) {
        return prev.filter(n => n !== nutrient);
      } else {
        return [...prev, nutrient];
      }
    });
  };

  const renderChart = () => {
    if (loading || !chartData) return null;
    
    if (reportType === REPORT_TYPES.TRENDS) {
      return (
        <div className="chart-container">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Nutrition Trends Over Time'
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                },
                legend: {
                  position: 'top',
                }
              }
            }}
          />
        </div>
      );
    } else if (reportType === REPORT_TYPES.DISTRIBUTION) {
      return (
        <div className="chart-container">
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Calories (kcal)'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Calorie Distribution by Meal Type'
                },
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      );
    } else if (reportType === REPORT_TYPES.NUTRIENT_BREAKDOWN) {
      return (
        <div className="chart-container">
          <div className="pie-chart-container" data-type="pie">
            <Pie 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Nutrient Breakdown'
                  },
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderNutrientToggles = () => {
    if (reportType !== REPORT_TYPES.TRENDS) return null;
    
    return (
      <div className="nutrient-toggles">
        <h3>Nutrients to Display</h3>
        <div className="toggle-container">
          {Object.keys(NUTRIENTS).map(nutrient => (
            <label key={nutrient} className="nutrient-toggle">
              <input
                type="checkbox"
                checked={selectedNutrients.includes(nutrient)}
                onChange={() => handleNutrientToggle(nutrient)}
              />
              <span style={{ color: NUTRIENTS[nutrient].borderColor }}>{NUTRIENTS[nutrient].label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-reports card-hover">
      <div className="report-header">
        <h2>Nutrition Reports</h2>
        
        <div className="report-controls">
          <div className="control-group">
            <div className="time-range-selector">
              <label htmlFor="time-range">Time Period:</label>
              <select
                id="time-range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {Object.values(TIME_PERIODS).map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="report-type-selector">
              <label htmlFor="report-type">Report Type:</label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value={REPORT_TYPES.TRENDS}>Nutrition Trends</option>
                <option value={REPORT_TYPES.DISTRIBUTION}>Meal Distribution</option>
                <option value={REPORT_TYPES.NUTRIENT_BREAKDOWN}>Nutrient Breakdown</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <p>Loading nutrition data...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && meals.length === 0 && (
        <div className="no-data-message">
          <p>No nutrition data available for the selected period.</p>
        </div>
      )}
      
      {!loading && !error && meals.length > 0 && (
        <>
          {renderNutrientToggles()}
          
          <div className="chart-wrapper">
            {renderChart()}
          </div>
          
          <div className="nutrition-summary">
            <h3>Nutrition Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Meals</span>
                <span className="stat-value">{meals.length}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Total Calories</span>
                <span className="stat-value">
                  {meals.reduce((sum, meal) => sum + (meal.nutritionInfo?.calories || 0), 0).toFixed(0)} kcal
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Avg. Daily Calories</span>
                <span className="stat-value">
                  {(meals.reduce((sum, meal) => sum + (meal.nutritionInfo?.calories || 0), 0) / 
                    Math.max(1, Object.keys(TIME_PERIODS).find(key => TIME_PERIODS[key].value === timeRange)?.days || 7)).toFixed(0)} kcal
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NutritionReports; 