import React, { useState, useEffect } from 'react';
import { nutritionService } from '../services/api.service';

const DAILY_REQUIREMENTS = {
  protein_g: { min: 50, name: 'Protein', foods: 'lean meat, fish, eggs, dairy, legumes, tofu', unit: 'g' },
  fiber_g: { min: 25, name: 'Fiber', foods: 'whole grains, vegetables, fruits, legumes, nuts', unit: 'g' },
  potassium_mg: { min: 3500, name: 'Potassium', foods: 'bananas, potatoes, spinach, yogurt, avocado', unit: 'mg' },
  calcium_mg: { min: 1000, name: 'Calcium', foods: 'dairy products, fortified plant milks, leafy greens', unit: 'mg' },
  vitamin_d_mcg: { min: 15, name: 'Vitamin D', foods: 'fatty fish, egg yolks, fortified milk, mushrooms', unit: 'mcg' },
  iron_mg: { min: 8, name: 'Iron', foods: 'red meat, spinach, beans, pumpkin seeds', unit: 'mg' },
  vitamin_c_mg: { min: 75, name: 'Vitamin C', foods: 'citrus fruits, bell peppers, berries, broccoli', unit: 'mg' }
};

const NutritionDeficiencyAlert = () => {
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [allNutrients, setAllNutrients] = useState([]);
  const [useLocalCalculation, setUseLocalCalculation] = useState(false);

  useEffect(() => {
    const analyzeNutritionData = async () => {
      try {
        setLoading(true);
        
        // Try to use the backend API for analysis
        if (!useLocalCalculation) {
          try {
            const analysisData = await nutritionService.getNutrientData(timeRange);
            if (analysisData && analysisData.success) {
              processBackendAnalysis(analysisData.data);
              return;
            }
          } catch (err) {
            console.warn('Backend nutrition analysis failed, falling back to local calculation:', err);
            setUseLocalCalculation(true);
          }
        }
        
        // Fallback to local calculation
        await performLocalAnalysis();
        
      } catch (error) {
        console.error('Error analyzing nutrition data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeNutritionData();
  }, [timeRange, useLocalCalculation]);
  
  const processBackendAnalysis = (data) => {
    const { nutrients } = data;
    const deficienciesList = [];
    const allNutrientsList = [];
    
    Object.keys(nutrients).forEach(key => {
      const nutrient = nutrients[key];
      
      // Skip nutrients without recommended values
      if (nutrient.recommendedValue === null) return;
      
      // Match nutrient key to our display names
      const requirementKey = Object.keys(DAILY_REQUIREMENTS).find(req => 
        req.toLowerCase() === key.toLowerCase()
      );
      
      if (!requirementKey) return;
      
      const requirement = DAILY_REQUIREMENTS[requirementKey];
      const percentOfReq = nutrient.percentOfRecommended;
      
      // Calculate alert level
      let alertLevel = 'good';
      if (percentOfReq < 50) {
        alertLevel = 'severe';
      } else if (percentOfReq < 80) {
        alertLevel = 'moderate';
      } else if (percentOfReq < 100) {
        alertLevel = 'mild';
      }
      
      const nutrientData = {
        nutrient: requirement.name,
        average: nutrient.dailyAverage.toFixed(1),
        unit: requirement.unit,
        recommended: requirement.recommendedValue,
        percent: percentOfReq.toFixed(0),
        foods: requirement.foods,
        alertLevel
      };
      
      allNutrientsList.push(nutrientData);
      
      // Add to deficiencies if below 100%
      if (percentOfReq < 100) {
        deficienciesList.push(nutrientData);
      }
    });
    
    // Sort by severity
    deficienciesList.sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));
    allNutrientsList.sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));
    
    setDeficiencies(deficienciesList);
    setAllNutrients(allNutrientsList);
  };
  
  const performLocalAnalysis = async () => {
    // Get user's meal history
    const response = await nutritionService.getMeals();
    const meals = Array.isArray(response.data) ? response.data : [];
    
    // Set time filter
    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }
    
    // Filter meals by date
    const filteredMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= startDate;
    });
    
    // Calculate average daily intake for each nutrient
    const totalDays = Math.max(1, Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)));
    
    // Aggregate nutrition data
    const totalNutrients = filteredMeals.reduce((acc, meal) => {
      const info = meal.nutritionInfo || {};
      
      // Process each nutrient
      Object.keys(info).forEach(key => {
        if (typeof info[key] === 'number') {
          acc[key] = (acc[key] || 0) + info[key];
        }
      });
      
      return acc;
    }, {});
    
    // Calculate daily averages
    const dailyAverages = {};
    Object.keys(totalNutrients).forEach(nutrient => {
      dailyAverages[nutrient] = totalNutrients[nutrient] / totalDays;
    });
    
    // Identify deficiencies
    const deficienciesList = [];
    const allNutrientsList = [];
    
    Object.keys(DAILY_REQUIREMENTS).forEach(nutrient => {
      const requirement = DAILY_REQUIREMENTS[nutrient];
      const average = dailyAverages[nutrient] || 0;
      const percentOfReq = (average / requirement.min) * 100;
      
      // Calculate alert level
      let alertLevel = 'good';
      if (percentOfReq < 50) {
        alertLevel = 'severe';
      } else if (percentOfReq < 80) {
        alertLevel = 'moderate';
      } else if (percentOfReq < 100) {
        alertLevel = 'mild';
      }
      
      const nutrientData = {
        nutrient: requirement.name,
        average: average.toFixed(1),
        unit: requirement.unit,
        recommended: requirement.min,
        percent: percentOfReq.toFixed(0),
        foods: requirement.foods,
        alertLevel
      };
      
      allNutrientsList.push(nutrientData);
      
      // Add to deficiencies if below 100%
      if (percentOfReq < 100) {
        deficienciesList.push(nutrientData);
      }
    });
    
    // Sort deficiencies by severity
    deficienciesList.sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));
    allNutrientsList.sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));
    
    setDeficiencies(deficienciesList);
    setAllNutrients(allNutrientsList);
  };
  
  if (loading) {
    return (
      <div className="deficiency-alert card-hover">
        <h3>Nutrition Analysis</h3>
        <p style={{ textAlign: 'center', padding: '1rem' }}>Analyzing your nutrition data...</p>
      </div>
    );
  }
  
  const getAlertMessage = (time) => {
    if (time === 'week') return '7 days';
    if (time === 'month') return '30 days';
    return 'your entire history';
  };
  
  const getAlertIcon = (level) => {
    switch (level) {
      case 'severe': return '⚠️'; // Warning
      case 'moderate': return '⚠️'; // Warning
      case 'mild': return '📊'; // Chart
      case 'good': return '✅'; // Check
      default: return '📊'; // Chart
    }
  };
  
  const getAlertColor = (level) => {
    switch (level) {
      case 'severe': return '#dc3545'; // Red
      case 'moderate': return '#fd7e14'; // Orange
      case 'mild': return '#ffc107'; // Yellow
      case 'good': return '#28a745'; // Green
      default: return '#6c757d'; // Gray
    }
  };
  
  return (
    <div className="deficiency-alert card-hover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Nutrition Analysis</h3>
        <div>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da',
              fontSize: '0.9rem'
            }}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setShowAllNutrients(!showAllNutrients)}
          style={{ 
            padding: '6px 12px', 
            background: 'none', 
            border: '1px solid #ced4da',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {showAllNutrients ? 'Show Deficiencies Only' : 'Show All Nutrients'}
        </button>
      </div>
      
      {(showAllNutrients ? allNutrients : deficiencies).length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <p>Great job! No nutrient deficiencies detected in {getAlertMessage(timeRange)}.</p>
        </div>
      ) : (
        <div className="deficiency-list">
          {(showAllNutrients ? allNutrients : deficiencies).map((item, index) => (
            <div 
              key={index} 
              className="deficiency-item"
              style={{ 
                borderLeft: `4px solid ${getAlertColor(item.alertLevel)}`,
                padding: '12px 16px',
                marginBottom: '10px',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '6px' }}>{getAlertIcon(item.alertLevel)}</span>
                    {item.nutrient}
                  </h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#666' }}>
                    You're getting {item.average} {item.unit} per day ({item.percent}% of recommended {item.recommended} {item.unit})
                  </p>
                  {item.percent < 100 && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#333' }}>
                      <strong>Try adding:</strong> {item.foods}
                    </p>
                  )}
                </div>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: getAlertColor(item.alertLevel),
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {item.percent}%
                </div>
              </div>
              
              <div style={{ marginTop: '8px', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, item.percent)}%`, 
                    backgroundColor: getAlertColor(item.alertLevel)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionDeficiencyAlert; 