const mongoose = require('mongoose');

// Define the schema
const RecipeSchema = new mongoose.Schema({
  Diet_type: {
    type: String,
    required: true,
  },
  Recipe_name: {
    type: String,
    required: true,
  },
  Cuisine_type: {
    type: String,
    required: true,
  },
  Protein: {
    type: Number,
    required: true,
  },
  Carbs: {
    type: Number,
    required: true,
  },
  Fat: {
    type: Number,
    required: true,
  },
  Extraction_day: {
    type: Date,
    required: true,
  },
  Extraction_time: {
    type: String,
    required: true,
  },
});

// Create the model
const DIET = mongoose.model('DIET', RecipeSchema);

// Export the model
module.exports = DIET;
