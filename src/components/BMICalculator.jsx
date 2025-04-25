import React, { useState, useEffect } from 'react';

const BMICalculator = ({ updateCalorieGoal }) => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [bmi, setBmi] = useState(0);
  const [bmiCategory, setBmiCategory] = useState('');
  const [recommendedCalories, setRecommendedCalories] = useState(0);

  // BMI categories and color coding
  const bmiCategories = [
    { range: [0, 18.5], name: 'Underweight', color: '#3498db' },
    { range: [18.5, 24.9], name: 'Normal weight', color: '#2ecc71' },
    { range: [25, 29.9], name: 'Overweight', color: '#f39c12' },
    { range: [30, 34.9], name: 'Obesity Class I', color: '#e74c3c' },
    { range: [35, 39.9], name: 'Obesity Class II', color: '#c0392b' },
    { range: [40, 100], name: 'Obesity Class III', color: '#962d22' }
  ];

  // Activity level multipliers for TDEE calculation
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9 // Very hard exercise & physical job or 2x training
  };

  useEffect(() => {
    calculateBMI();
  }, [weight, height, age, gender, activityLevel]);

  const calculateBMI = () => {
    // Calculate BMI: weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue);

    // Determine BMI category
    for (const category of bmiCategories) {
      if (bmiValue >= category.range[0] && bmiValue < category.range[1]) {
        setBmiCategory(category);
        break;
      }
    }

    // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * activityMultipliers[activityLevel];

    // Recommended calories based on BMI category
    let calories = tdee;
    if (bmiValue < 18.5) {
      // Underweight: Add 500 calories for weight gain
      calories = tdee + 500;
    } else if (bmiValue >= 25) {
      // Overweight: Subtract 500 calories for weight loss
      calories = Math.max(1200, tdee - 500);
    }

    setRecommendedCalories(calories);
  };

  return (
    <div className="bmi-calculator card-hover">
      <h3>BMI & Calorie Calculator</h3>
      
      <div className="bmi-inputs">
        <div className="input-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            min="30"
            max="250"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            id="height"
            type="number"
            min="120"
            max="250"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            min="15"
            max="120"
            value={age}
            onChange={(e) => setAge(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        
        <div className="input-group">
          <label htmlFor="activity">Activity Level</label>
          <select
            id="activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
          >
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="veryActive">Very Active (2x per day)</option>
          </select>
        </div>
      </div>
      
      <div className="bmi-results">
        <div className="bmi-result-group">
          <div className="bmi-score">
            <h4>Your BMI</h4>
            <div className="bmi-value" style={{ color: bmiCategory?.color }}>
              {bmi.toFixed(1)}
            </div>
            <div className="bmi-category" style={{ color: bmiCategory?.color }}>
              {bmiCategory?.name}
            </div>
          </div>
          
          <div className="bmi-scale">
            {bmiCategories.map((category, index) => (
              <div 
                key={index}
                className="bmi-scale-segment"
                style={{ 
                  backgroundColor: category.color,
                  flex: category.range[1] - category.range[0],
                  position: 'relative'
                }}
              >
                {index === 0 && <small className="scale-label left">Low</small>}
                {index === 2 && <small className="scale-label center">BMI Scale</small>}
                {index === bmiCategories.length - 1 && <small className="scale-label right">High</small>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="calorie-recommendation">
          <h4>Recommended Daily Calories</h4>
          <div className="calorie-value">
            {Math.round(recommendedCalories)} kcal
          </div>
          <p className="calorie-explanation">
            {bmi < 18.5 ? 
              'Includes 500 extra calories to help gain weight.' : 
              bmi >= 25 ? 
              'Includes 500 fewer calories to help lose weight.' : 
              'Maintains your current weight.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator; 