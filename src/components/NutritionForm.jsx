import React, { useState } from 'react';
import { nutritionService, handleApiError } from '../services/api.service';

const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  MORNING_SNACK: 'Morning Snack',
  LUNCH: 'Lunch',
  AFTERNOON_SNACK: 'Afternoon Snack',
  DINNER: 'Dinner',
  EVENING_SNACK: 'Evening Snack',
  OTHER: 'Other'
};

const NutritionForm = ({ onSearch }) => {
  const [dishName, setDishName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!dishName.trim() || !quantity.trim()) {
      setError('Please enter both dish name and quantity');
      setLoading(false);
      return;
    }

    try {
      // First, search for nutrition info
      const searchResult = await onSearch(dishName, quantity);
      
      // If search was successful, save the meal to backend
      if (searchResult) {
        const mealData = {
          name: dishName,
          quantity: quantity,
          mealType: mealType,
          nutritionInfo: searchResult,
          timestamp: new Date().toISOString()
        };

        const response = await nutritionService.addMeal(mealData);
        console.log('Meal saved:', response);
        
        // Show success message
        setSuccess(true);
        
        // Clear form after successful submission
        setDishName('');
        setQuantity('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      setError(handleApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container card-hover">
      <h2>Nutrition Tracker</h2>
      
      {success && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          fontSize: '0.9rem'
        }}>
          Meal added successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ width: '100%' }}>
          <label>Meal Type:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          >
            {Object.values(MEAL_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div style={{ width: '100%' }}>
          <label>Dish Name:</label>
          <input
            type="text"
            placeholder="e.g., chicken, apple, rice"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0' }}>
            Be specific for better results (e.g., "grilled chicken breast" instead of just "chicken")
          </p>
        </div>
        <div style={{ width: '100%' }}>
          <label>Quantity (e.g., 1 cup, 100 grams):</label>
          <input
            type="text"
            placeholder="e.g., 1 cup, 100g, 3 oz"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0' }}>
            Include units like cups, grams, oz, tablespoons, etc.
          </p>
        </div>
        
        <button type="submit" disabled={loading || !dishName || !quantity}>
          {loading ? 'Loading...' : 'Get Nutrition Info'}
        </button>
      </form>
    </div>
  );
};

export default NutritionForm;