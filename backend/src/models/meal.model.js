const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a meal name'],
    trim: true
  },
  quantity: {
    type: String,
    required: [true, 'Please provide a quantity'],
    trim: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack', 'Other'],
    default: 'Other'
  },
  nutritionInfo: {
    calories: {
      type: Number,
      required: true
    },
    protein_g: {
      type: Number,
      default: 0
    },
    carbohydrates_total_g: {
      type: Number,
      default: 0
    },
    fat_total_g: {
      type: Number,
      default: 0
    },
    fat_saturated_g: Number,
    cholesterol_mg: Number,
    sodium_mg: Number,
    potassium_mg: Number,
    fiber_g: Number,
    sugar_g: Number,
    serving_size_g: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create an index for efficiently querying meals by user and date
MealSchema.index({ user: 1, timestamp: 1 });

module.exports = mongoose.model('Meal', MealSchema); 