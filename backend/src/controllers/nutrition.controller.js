const Meal = require('../models/meal.model');
const User = require('../models/user.model');

/**
 * @desc    Analyze nutrition data for potential deficiencies
 * @route   GET /api/nutrition/analysis
 * @access  Private
 */
exports.analyzeNutrition = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Set time filter
    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }
    
    // Find meals for the specified time range
    const meals = await Meal.find({
      user: req.user._id,
      timestamp: {
        $gte: startDate
      }
    });

    // Daily recommended values for common nutrients
    const dailyRecommendations = {
      calcium_mg: 1000,
      cholesterol_mg: 300,
      fiber_g: 25,
      iron_mg: 8,
      potassium_mg: 3500,
      protein_g: 50,
      sodium_mg: 2300,
      vitamin_a_iu: 3000,
      vitamin_c_mg: 75,
      vitamin_d_mcg: 15
    };

    // Calculate total days in the range
    const totalDays = Math.max(1, Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)));
    
    // Aggregate nutrition data
    const nutritionTotals = {};
    
    meals.forEach(meal => {
      const info = meal.nutritionInfo || {};
      
      // Process each nutrient
      Object.keys(info).forEach(key => {
        if (typeof info[key] === 'number') {
          nutritionTotals[key] = (nutritionTotals[key] || 0) + info[key];
        }
      });
    });
    
    // Calculate daily averages and detect deficiencies
    const nutrientAnalysis = {};
    Object.keys(nutritionTotals).forEach(nutrient => {
      const dailyAverage = nutritionTotals[nutrient] / totalDays;
      const recommendedValue = dailyRecommendations[nutrient] || null;
      
      nutrientAnalysis[nutrient] = {
        total: nutritionTotals[nutrient],
        dailyAverage,
        recommendedValue,
        percentOfRecommended: recommendedValue ? (dailyAverage / recommendedValue) * 100 : null,
        deficient: recommendedValue ? dailyAverage < recommendedValue : null
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        timeRange,
        daysInRange: totalDays,
        nutrients: nutrientAnalysis
      }
    });

  } catch (error) {
    console.error('Nutrition analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 