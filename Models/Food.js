const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: String },
    calories: Number,
    caloriesConsumed: Number,
    foods: [{
        name: { type: String, required: true },
        calories: { type: Number, required: true },
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food Data" },
        servingSize: Number, protein: Number,
        carbs: Number,
        fat: Number
    }],
    macronutrients: {
        protein: Number,
        carbs: Number,
        fat: Number
    }
}, {
    timestamps: true,
    indexes: [
        { key: { date: 1 } }
    ]
});

const FOOD = mongoose.model('Food', FoodSchema);

module.exports = FOOD;
