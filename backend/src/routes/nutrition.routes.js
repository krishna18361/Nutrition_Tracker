const express = require('express');
const { getNutritionStats } = require('../controllers/meal.controller');
const { analyzeNutrition } = require('../controllers/nutrition.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get nutrition stats for dashboard
router.get('/stats', getNutritionStats);

// Analyze nutrition data for deficiencies
router.get('/analysis', analyzeNutrition);

// Search for nutrition data
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    // Since we're using CalorieNinjas API directly from the frontend,
    // this endpoint can either be implemented to proxy requests
    // or return a predefined response
    
    return res.status(200).json({
      success: true,
      message: 'Search functionality is implemented directly in the frontend',
      query
    });
  } catch (error) {
    console.error('Nutrition search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 