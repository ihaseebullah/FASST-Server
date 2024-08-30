const { default: mongoose } = require("mongoose");

const FoodSchema = new mongoose.Schema({
    Category: String,
    Description: String,
    'Nutrient Bank Number': Number,
    Data: Object
})

const FOOD_DATA = mongoose.model('food data', FoodSchema);

module.exports = FOOD_DATA;