const Meal = require('../models/meal.model');
const User = require('../models/user.model');

/**
 * @desc    Get all meals for the logged in user
 * @route   GET /api/meals
 * @access  Private
 */
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user._id }).sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single meal
 * @route   GET /api/meals/:id
 * @access  Private
 */
exports.getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if meal belongs to user
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this meal'
      });
    }

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new meal
 * @route   POST /api/meals
 * @access  Private
 */
exports.addMeal = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user._id;
    
    const meal = await Meal.create(req.body);

    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update a meal
 * @route   PUT /api/meals/:id
 * @access  Private
 */
exports.updateMeal = async (req, res) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if meal belongs to user
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this meal'
      });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a meal
 * @route   DELETE /api/meals/:id
 * @access  Private
 */
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if meal belongs to user
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this meal'
      });
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get nutrition stats (for dashboard)
 * @route   GET /api/nutrition/stats
 * @access  Private
 */
exports.getNutritionStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's meals for today
    const meals = await Meal.find({
      user: req.user._id,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get user's calorie goal
    const user = await User.findById(req.user._id);
    const calorieGoal = user?.calorieGoal || 2000;

    // Calculate total calories and meal breakdown
    let totalCalories = 0;
    const mealBreakdown = {
      breakfast: 0,
      morningSnack: 0,
      lunch: 0,
      afternoonSnack: 0,
      dinner: 0,
      eveningSnack: 0,
      other: 0
    };

    // Initialize nutrients object
    const nutrients = {
      protein_g: { dailyAverage: 0, percentOfRecommended: 0 },
      carbohydrates_total_g: { dailyAverage: 0, percentOfRecommended: 0 },
      fat_total_g: { dailyAverage: 0, percentOfRecommended: 0 },
      fiber_g: { dailyAverage: 0, percentOfRecommended: 0 },
      calcium_mg: { dailyAverage: 0, percentOfRecommended: 0 },
      iron_mg: { dailyAverage: 0, percentOfRecommended: 0 },
      potassium_mg: { dailyAverage: 0, percentOfRecommended: 0 },
      sodium_mg: { dailyAverage: 0, percentOfRecommended: 0 },
      vitamin_c_mg: { dailyAverage: 0, percentOfRecommended: 0 },
      cholesterol_mg: { dailyAverage: 0, percentOfRecommended: 0 }
    };

    // Daily recommended values (matching frontend)
    const recommendedValues = {
      protein_g: 50,
      carbohydrates_total_g: 275,
      fat_total_g: 70,
      fiber_g: 28,
      calcium_mg: 1000,
      iron_mg: 18,
      potassium_mg: 3500,
      sodium_mg: 2300,
      vitamin_c_mg: 75,
      cholesterol_mg: 300
    };

    // Calculate totals from meals
    meals.forEach(meal => {
      const calories = meal.nutritionInfo?.calories || 0;
      totalCalories += calories;

      // Add calories to meal breakdown
      const mealType = meal.mealType?.toLowerCase() || 'other';
      if (mealBreakdown.hasOwnProperty(mealType)) {
        mealBreakdown[mealType] += calories;
      } else {
        mealBreakdown.other += calories;
      }

      // Calculate nutrient totals
      Object.keys(nutrients).forEach(nutrient => {
        const value = meal.nutritionInfo?.[nutrient] || 0;
        nutrients[nutrient].dailyAverage += value;
      });
    });

    // Calculate percentages of recommended values
    Object.keys(nutrients).forEach(nutrient => {
      const recommended = recommendedValues[nutrient];
      if (recommended) {
        nutrients[nutrient].percentOfRecommended = (nutrients[nutrient].dailyAverage / recommended) * 100;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalCalories,
        calorieGoal,
        mealBreakdown,
        nutrients
      }
    });
  } catch (error) {
    console.error('Error getting nutrition stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting nutrition stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get nutrient analysis data
 * @route   GET /api/nutrition/analysis
 * @access  Private
 */
exports.getNutrientAnalysis = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      // Default to week
      startDate.setDate(startDate.getDate() - 7);
    }
    
    // Get meals within date range
    const meals = await Meal.find({
      user: req.user._id,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Daily recommended values
    const recommendedValues = {
      protein_g: 50,
      carbohydrates_total_g: 275,
      fat_total_g: 70,
      fiber_g: 28,
      calcium_mg: 1000,
      iron_mg: 18,
      potassium_mg: 3500,
      sodium_mg: 2300,
      vitamin_c_mg: 75,
      cholesterol_mg: 300
    };
    
    // Initialize nutrient totals
    const nutrientTotals = {};
    Object.keys(recommendedValues).forEach(nutrient => {
      nutrientTotals[nutrient] = 0;
    });
    
    // Calculate total days in the range
    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Sum up nutrients from all meals
    meals.forEach(meal => {
      const nutritionInfo = meal.nutritionInfo || {};
      Object.keys(nutrientTotals).forEach(nutrient => {
        nutrientTotals[nutrient] += nutritionInfo[nutrient] || 0;
      });
    });
    
    // Calculate daily averages and percentages
    const nutrients = {};
    Object.keys(nutrientTotals).forEach(nutrient => {
      const dailyAverage = nutrientTotals[nutrient] / totalDays;
      const recommended = recommendedValues[nutrient];
      const percentOfRecommended = recommended ? (dailyAverage / recommended) * 100 : 0;
      
      nutrients[nutrient] = {
        dailyAverage,
        percentOfRecommended
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        nutrients,
        timeRange,
        startDate,
        endDate,
        totalDays
      }
    });
  } catch (error) {
    console.error('Error getting nutrient analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting nutrient analysis',
      error: error.message
    });
  }
}; 