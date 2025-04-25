const express = require('express');
const { 
  getMeals, 
  getMeal, 
  addMeal, 
  updateMeal, 
  deleteMeal,
  getNutritionStats,
  getNutrientAnalysis
} = require('../controllers/meal.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Meal routes
router.route('/')
  .get(getMeals)
  .post(addMeal);

router.route('/:id')
  .get(getMeal)
  .put(updateMeal)
  .delete(deleteMeal);

// Nutrition routes
router.get('/nutrition/stats', getNutritionStats);
router.get('/nutrition/analysis', getNutrientAnalysis);

module.exports = router; 