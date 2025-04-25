import React from 'react';

/**
 * Calculate a quality score (A-F) for a meal based on its nutritional balance
 * @param {Object} nutrition - Nutrition information for the meal
 * @returns {Object} - Score information including letter grade, description and color
 */
const calculateMealQuality = (nutrition) => {
  if (!nutrition) {
    return { 
      grade: 'N/A', 
      description: 'No nutrition data available', 
      color: '#888',
      score: 0
    };
  }

  // Extract relevant nutritional values with fallbacks to 0
  const protein = nutrition.protein_g || 0;
  const carbs = nutrition.carbohydrates_total_g || 0;
  const fat = nutrition.fat_total_g || 0;
  const fiber = nutrition.fiber_g || 0;
  const sugar = nutrition.sugar_g || 0;
  const sodium = nutrition.sodium_mg || 0;
  const calories = nutrition.calories || 0;
  
  // Calculate macronutrient balance (percentages of total calories)
  const totalCalories = calories > 0 ? calories : (protein * 4 + carbs * 4 + fat * 9);
  
  if (totalCalories === 0) {
    return { 
      grade: 'N/A', 
      description: 'Insufficient data', 
      color: '#888',
      score: 0
    };
  }

  // Calculate percentages of calories from each macronutrient
  const proteinPct = (protein * 4) / totalCalories * 100;
  const carbsPct = (carbs * 4) / totalCalories * 100;
  const fatPct = (fat * 9) / totalCalories * 100;

  // Scoring criteria (max 100 points)
  let score = 0;
  
  // 1. Macronutrient balance (40 points)
  // Ideal ranges: Protein 15-35%, Carbs 45-65%, Fat 20-35%
  const proteinBalance = Math.min(1, 1 - Math.abs(proteinPct - 25) / 25);
  const carbsBalance = Math.min(1, 1 - Math.abs(carbsPct - 55) / 40);
  const fatBalance = Math.min(1, 1 - Math.abs(fatPct - 27) / 27);
  score += (proteinBalance * 15 + carbsBalance * 10 + fatBalance * 15);
  
  // 2. Fiber content (15 points) - target ~14g per 1000 calories
  const fiberTarget = totalCalories / 1000 * 14;
  const fiberScore = Math.min(1, fiber / fiberTarget);
  score += (fiberScore * 15);
  
  // 3. Sugar content (15 points) - lower is better, target <10% of calories
  const sugarCalories = sugar * 4;
  const sugarPct = (sugarCalories / totalCalories) * 100;
  const sugarScore = Math.min(1, 1 - (sugarPct / 20)); // 0% sugar = 15 points, 20%+ = 0 points
  score += (sugarScore * 15);
  
  // 4. Sodium content (15 points) - lower is better, target <1000mg per 1000 calories
  const sodiumTarget = totalCalories / 1000 * 1000;
  const sodiumScore = Math.min(1, 1 - (sodium / (sodiumTarget * 2))); // 0mg = 15 points, 2x target = 0 points
  score += (sodiumScore * 15);
  
  // 5. Meal size (15 points) - based on calorie content
  // Penalize very small meals (<150 cal) and very large meals (>1000 cal)
  let sizeScore = 1;
  if (calories < 150) {
    sizeScore = calories / 150;
  } else if (calories > 1000) {
    sizeScore = Math.max(0, 1 - (calories - 1000) / 1000);
  }
  score += (sizeScore * 15);
  
  // Determine letter grade
  let grade, description, color;
  if (score >= 90) {
    grade = 'A';
    description = 'Excellent balance of nutrients!';
    color = '#4CAF50'; // Green
  } else if (score >= 80) {
    grade = 'B';
    description = 'Good nutritional quality';
    color = '#8BC34A'; // Light green
  } else if (score >= 70) {
    grade = 'C';
    description = 'Decent balance, room for improvement';
    color = '#FFC107'; // Amber
  } else if (score >= 60) {
    grade = 'D';
    description = 'Nutritional imbalance';
    color = '#FF9800'; // Orange
  } else {
    grade = 'F';
    description = 'Poor nutritional quality';
    color = '#F44336'; // Red
  }
  
  return { grade, description, color, score: Math.round(score) };
};

const MealQualityScore = ({ nutrition }) => {
  const quality = calculateMealQuality(nutrition);
  
  return (
    <div className="meal-quality-score">
      <div className="quality-header">
        <h4>Meal Quality Score</h4>
      </div>
      
      <div className="quality-grade" style={{ backgroundColor: quality.color }}>
        {quality.grade}
      </div>
      
      <div className="quality-details">
        <p className="quality-description">{quality.description}</p>
        <div className="quality-score-bar">
          <div 
            className="quality-score-fill"
            style={{ 
              width: `${quality.score}%`,
              backgroundColor: quality.color
            }}
          ></div>
          <span className="quality-score-value">{quality.score}/100</span>
        </div>
      </div>
      
      <div className="quality-tips">
        {quality.grade !== 'A' && (
          <div className="improvement-tips">
            <h5>Tips for improvement:</h5>
            <ul>
              {(nutrition?.protein_g || 0) < ((nutrition?.calories || 0) / 1000 * 50) && (
                <li>Add more protein sources</li>
              )}
              {(nutrition?.fiber_g || 0) < ((nutrition?.calories || 0) / 1000 * 14) && (
                <li>Include more fiber-rich foods</li>
              )}
              {((nutrition?.sugar_g || 0) * 4) > ((nutrition?.calories || 0) * 0.1) && (
                <li>Reduce added sugars</li>
              )}
              {(nutrition?.sodium_mg || 0) > ((nutrition?.calories || 0) / 1000 * 1000) && (
                <li>Lower sodium content</li>
              )}
              {(nutrition?.fat_total_g || 0) * 9 > ((nutrition?.calories || 0) * 0.35) && (
                <li>Reduce overall fat content</li>
              )}
            </ul>
          </div>
        )}
        {quality.grade === 'A' && (
          <p className="great-job">Great job! This meal has excellent nutritional balance.</p>
        )}
      </div>
    </div>
  );
};

export default MealQualityScore;
export { calculateMealQuality }; 