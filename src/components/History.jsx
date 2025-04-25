import React, { useState, useEffect } from 'react';
import { nutritionService, handleApiError } from '../services/api.service';
import { calculateMealQuality } from './MealQualityScore';

const History = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupByMeal, setGroupByMeal] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const response = await nutritionService.getMeals();
        setMeals(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching meals:', error);
        setError(handleApiError(error).message);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleDeleteMeal = async (id) => {
    try {
      await nutritionService.deleteMeal(id);
      setMeals(prevMeals => prevMeals.filter(meal => meal._id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError(handleApiError(error).message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🍱';
      case 'dinner':
        return '🍽️';
      case 'snack':
        return '🥪';
      default:
        return '🍴';
    }
  };
  
  if (loading) {
    return (
      <div className="history card-hover">
        <h3>Meal History</h3>
        <div className="loading-message">Loading your meal history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history card-hover">
        <h3>Meal History</h3>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }
  
  if (meals.length === 0) {
    return (
      <div className="history card-hover">
        <h3>Meal History</h3>
        <div className="empty-message">
          <p>No meals recorded yet.</p>
          <p className="subtitle">Start tracking your meals to see your history here.</p>
        </div>
      </div>
    );
  }

  // Format and group meals
  const groupedMeals = meals.reduce((acc, meal) => {
    const mealType = meal.mealType || 'Other';
    if (!acc[mealType]) {
      acc[mealType] = {
        items: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalSodium: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSaturatedFat: 0,
        totalTransFat: 0,
        totalCholesterol: 0
      };
    }
    
    acc[mealType].items.push({
      ...meal,
      calories: meal.nutritionInfo?.calories || 0,
      protein_g: meal.nutritionInfo?.protein_g || 0,
      carbohydrates_total_g: meal.nutritionInfo?.carbohydrates_total_g || 0,
      fat_total_g: meal.nutritionInfo?.fat_total_g || 0,
      sodium_mg: meal.nutritionInfo?.sodium_mg || 0,
      fiber_g: meal.nutritionInfo?.fiber_g || 0,
      sugar_g: meal.nutritionInfo?.sugar_g || 0,
      saturated_fat_g: meal.nutritionInfo?.saturated_fat_g || 0,
      trans_fat_g: meal.nutritionInfo?.trans_fat_g || 0,
      cholesterol_mg: meal.nutritionInfo?.cholesterol_mg || 0
    });
    
    acc[mealType].totalCalories += meal.nutritionInfo?.calories || 0;
    acc[mealType].totalProtein += meal.nutritionInfo?.protein_g || 0;
    acc[mealType].totalCarbs += meal.nutritionInfo?.carbohydrates_total_g || 0;
    acc[mealType].totalFat += meal.nutritionInfo?.fat_total_g || 0;
    acc[mealType].totalSodium += meal.nutritionInfo?.sodium_mg || 0;
    acc[mealType].totalFiber += meal.nutritionInfo?.fiber_g || 0;
    acc[mealType].totalSugar += meal.nutritionInfo?.sugar_g || 0;
    acc[mealType].totalSaturatedFat += meal.nutritionInfo?.saturated_fat_g || 0;
    acc[mealType].totalTransFat += meal.nutritionInfo?.trans_fat_g || 0;
    acc[mealType].totalCholesterol += meal.nutritionInfo?.cholesterol_mg || 0;
    
    return acc;
  }, {});

  // Sort meals by date (newest first)
  const sortedMeals = [...meals].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const renderNutrientDetails = (item) => {
    return (
      <div className="nutrient-details">
        <div className="nutrient-row">
          <span className="nutrient-label">Calories:</span>
          <span className="nutrient-value">{item.calories.toFixed(0)} kcal</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Protein:</span>
          <span className="nutrient-value">{item.protein_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Carbohydrates:</span>
          <span className="nutrient-value">{item.carbohydrates_total_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Fat:</span>
          <span className="nutrient-value">{item.fat_total_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Saturated Fat:</span>
          <span className="nutrient-value">{item.saturated_fat_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Trans Fat:</span>
          <span className="nutrient-value">{item.trans_fat_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Cholesterol:</span>
          <span className="nutrient-value">{item.cholesterol_mg.toFixed(0)}mg</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Sodium:</span>
          <span className="nutrient-value">{item.sodium_mg.toFixed(0)}mg</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Fiber:</span>
          <span className="nutrient-value">{item.fiber_g.toFixed(1)}g</span>
        </div>
        <div className="nutrient-row">
          <span className="nutrient-label">Sugar:</span>
          <span className="nutrient-value">{item.sugar_g.toFixed(1)}g</span>
        </div>
      </div>
    );
  };

  // Get meal quality grade badge
  const renderQualityBadge = (nutrition) => {
    const quality = calculateMealQuality(nutrition);
    
    return (
      <div 
        className="meal-quality-badge"
        style={{ 
          backgroundColor: quality.color,
          color: 'white',
          fontWeight: 'bold',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          marginLeft: '8px'
        }}
      >
        {quality.grade}
      </div>
    );
  };

  return (
    <div className="history card-hover">
      <div className="history-header">
        <h3>Meal History</h3>
        <button 
          onClick={() => setGroupByMeal(!groupByMeal)}
          className="toggle-button"
        >
          {groupByMeal ? 'Show All Meals' : 'Group by Meal Type'}
        </button>
      </div>

      {groupByMeal ? (
        // Grouped view
        Object.entries(groupedMeals).map(([mealType, mealData]) => (
          <div key={mealType} className="meal-group">
            <div className="meal-group-header">
              <span className="meal-type-icon">{getMealTypeIcon(mealType)}</span>
              <h4 className="meal-type-title">{mealType}</h4>
              <div className="meal-type-summary">
                <span className="calories">{mealData.totalCalories.toFixed(0)} kcal</span>
                <span className="macros">
                  P: {mealData.totalProtein.toFixed(1)}g • 
                  C: {mealData.totalCarbs.toFixed(1)}g • 
                  F: {mealData.totalFat.toFixed(1)}g
                </span>
              </div>
            </div>
            
            <div className="meal-items">
              {mealData.items.map((item) => (
                <div key={item._id} className="meal-item">
                  <div className="meal-item-content">
                    <div className="meal-item-name" onClick={() => toggleExpand(item._id)}>
                      {item.name}
                      {renderQualityBadge(item.nutritionInfo)}
                      <span className="expand-icon">{expandedItems[item._id] ? '▼' : '▶'}</span>
                    </div>
                    <div className="meal-item-details">
                      <span className="calories">{item.calories.toFixed(0)} kcal</span>
                      <span className="macros">
                        P: {item.protein_g.toFixed(1)}g • 
                        C: {item.carbohydrates_total_g.toFixed(1)}g • 
                        F: {item.fat_total_g.toFixed(1)}g
                      </span>
                    </div>
                    {expandedItems[item._id] && renderNutrientDetails(item)}
                  </div>
                  <button 
                    onClick={() => handleDeleteMeal(item._id)}
                    className="delete-button"
                    aria-label="Delete meal"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // All meals view
        <div className="meal-items">
          {sortedMeals.map((item) => (
            <div key={item._id} className="meal-item">
              <div className="meal-item-content">
                <div className="meal-item-name" onClick={() => toggleExpand(item._id)}>
                  <span className="meal-type-icon">{getMealTypeIcon(item.mealType)}</span> {item.name}
                  {renderQualityBadge(item.nutritionInfo)}
                  <span className="expand-icon">{expandedItems[item._id] ? '▼' : '▶'}</span>
                </div>
                <div className="meal-item-details">
                  <span className="calories">{(item.nutritionInfo?.calories || 0).toFixed(0)} kcal</span>
                  <span className="macros">
                    P: {(item.nutritionInfo?.protein_g || 0).toFixed(1)}g • 
                    C: {(item.nutritionInfo?.carbohydrates_total_g || 0).toFixed(1)}g • 
                    F: {(item.nutritionInfo?.fat_total_g || 0).toFixed(1)}g
                  </span>
                </div>
                {expandedItems[item._id] && renderNutrientDetails({
                  calories: item.nutritionInfo?.calories || 0,
                  protein_g: item.nutritionInfo?.protein_g || 0,
                  carbohydrates_total_g: item.nutritionInfo?.carbohydrates_total_g || 0,
                  fat_total_g: item.nutritionInfo?.fat_total_g || 0,
                  sodium_mg: item.nutritionInfo?.sodium_mg || 0,
                  fiber_g: item.nutritionInfo?.fiber_g || 0,
                  sugar_g: item.nutritionInfo?.sugar_g || 0,
                  saturated_fat_g: item.nutritionInfo?.saturated_fat_g || 0,
                  trans_fat_g: item.nutritionInfo?.trans_fat_g || 0,
                  cholesterol_mg: item.nutritionInfo?.cholesterol_mg || 0
                })}
              </div>
              <button 
                onClick={() => handleDeleteMeal(item._id)}
                className="delete-button"
                aria-label="Delete meal"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;