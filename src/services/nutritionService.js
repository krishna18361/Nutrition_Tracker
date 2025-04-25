import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Ensure cookies and auth headers are sent with requests
  timeout: 30000 // Increased timeout to 30 seconds
});

// Simple event system for component communications
export const eventEmitter = {
  events: {},
  
  // Subscribe to an event
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  // Emit an event with data
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
};

// Event constants
export const EVENTS = {
  MEAL_ADDED: 'meal_added',
  MEAL_DELETED: 'meal_deleted',
  MEAL_UPDATED: 'meal_updated'
};

/**
 * Fetch meals within a specified date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of meal objects
 */
export const getMealsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/meals`, {
      params: { startDate, endDate }
    });
    
    // Handle different response formats and ensure we always return an array
    if (response.data && response.data.data) {
      return response.data.data; // API returns { success: true, data: [...] }
    } else if (Array.isArray(response.data)) {
      return response.data; // API directly returns an array
    } else {
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error fetching meals by date range:', error);
    throw new Error('Failed to fetch meals');
  }
};

/**
 * Add a new meal
 * @param {Object} mealData - Meal data object
 * @returns {Promise<Object>} - Created meal object
 */
export const addMeal = async (mealData) => {
  try {
    const response = await api.post('/meals', mealData);
    // Emit meal added event
    eventEmitter.emit(EVENTS.MEAL_ADDED, response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw new Error('Failed to add meal');
  }
};

/**
 * Update an existing meal
 * @param {string} mealId - ID of the meal to update
 * @param {Object} mealData - Updated meal data
 * @returns {Promise<Object>} - Updated meal object
 */
export const updateMeal = async (mealId, mealData) => {
  try {
    const response = await api.put(`/meals/${mealId}`, mealData);
    // Emit meal updated event
    eventEmitter.emit(EVENTS.MEAL_UPDATED, response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw new Error('Failed to update meal');
  }
};

/**
 * Delete a meal by ID
 * @param {string} mealId - ID of the meal to delete
 * @returns {Promise<Object>} - Response data
 */
export const deleteMeal = async (mealId) => {
  try {
    const response = await api.delete(`/meals/${mealId}`);
    // Emit meal deleted event
    eventEmitter.emit(EVENTS.MEAL_DELETED, { mealId });
    return response.data;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw new Error('Failed to delete meal');
  }
};

/**
 * Check backend health/connection
 * @returns {Promise<boolean>} - True if the backend is healthy
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Get all meals
export const getAllMeals = async () => {
  try {
    const response = await api.get('/meals');
    return response.data;
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

// Get meal by ID
export const getMealById = async (id) => {
  try {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meal with id ${id}:`, error);
    throw error;
  }
};

// Get nutrition data for a food item
export const getNutritionData = async (query) => {
  try {
    const response = await api.get(`/nutrition/search`, {
      params: { query },
      timeout: 30000 // Specific timeout for this endpoint
    });
    
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`Server error: ${error.response.data.message || 'Failed to fetch nutrition data'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Failed to fetch nutrition data. Please try again.');
    }
  }
};

export default {
  getAllMeals,
  getMealsByDateRange,
  getMealById,
  addMeal,
  updateMeal,
  deleteMeal,
  getNutritionData,
  checkBackendHealth
}; 