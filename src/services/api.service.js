import api from '../config/api.config';

// Auth services
export const authService = {
    login: async (credentials) => {
        try {
            return await api.post('/auth/login', credentials);
        } catch (error) {
            console.error('Login service error:', error);
            throw error;
        }
    },
    register: async (userData) => {
        try {
            return await api.post('/auth/register', userData);
        } catch (error) {
            console.error('Register service error:', error);
            throw error;
        }
    },
    logout: () => api.post('/auth/logout'),
};

// User services
export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
};

// Nutrition services
export const nutritionService = {
    getMeals: async () => {
        try {
            const response = await api.get('/meals');
            return { data: response.data.data || [] };
        } catch (error) {
            console.error('Error in getMeals service:', error);
            throw error;
        }
    },
    getMealsByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get('/meals', {
                params: { startDate, endDate }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching meals by date range:', error);
            throw error;
        }
    },
    addMeal: (mealData) => api.post('/meals', mealData),
    updateMeal: (id, mealData) => api.put(`/meals/${id}`, mealData),
    deleteMeal: (id) => api.delete(`/meals/${id}`),
    getNutritionStats: async () => {
        try {
            const response = await api.get('/nutrition/stats');
            console.log('Nutrition stats response:', response.data);
            
            // Return the response data directly since it's already in the correct format
            return response.data;
        } catch (error) {
            console.error('Error in getNutritionStats service:', error);
            throw error;
        }
    },
    getNutrientData: async (timeRange = 'week') => {
        try {
            const response = await api.get(`/nutrition/analysis?timeRange=${timeRange}`);
            return response.data;
        } catch (error) {
            console.error('Error getting nutrient analysis:', error);
            throw error;
        }
    }
};

// Error handling utility
export const handleApiError = (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return new Error(message);
}; 