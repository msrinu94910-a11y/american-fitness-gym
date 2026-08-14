const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealType: { type: String, default: 'Breakfast' }, // Breakfast, Lunch, Snack, Dinner
  time: { type: String, default: '08:00 AM' },
  foodItems: { type: String, required: true },
  calories: { type: Number, default: 400 },
  proteinGrams: { type: Number, default: 30 },
  carbsGrams: { type: Number, default: 40 },
  fatsGrams: { type: Number, default: 10 },
  instructions: { type: String, default: '' }
});

const dietPlanSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  trainerId: { type: String, required: true },
  title: { type: String, default: 'Lean Muscle & Energy Nutrition Plan' },
  dailyCalories: { type: Number, default: 2200 },
  proteinGrams: { type: Number, default: 160 },
  carbsGrams: { type: Number, default: 200 },
  fatsGrams: { type: Number, default: 60 },
  waterLiters: { type: Number, default: 3.5 },
  meals: [mealSchema],
  createdDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
