import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const nutritionService = {
  async getNutrientData(timeRange = 'week') {
    try {
      const response = await axios.get(`${API_URL}/nutrition/analysis`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrient data:', error);
      throw error;
    }
  },

  async getNutritionStats() {
    try {
      const response = await axios.get(`${API_URL}/nutrition/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      throw error;
    }
  },

  async getMeals(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/meals`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  }
}; 