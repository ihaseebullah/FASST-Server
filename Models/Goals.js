const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalType: {
        type: String,
        enum: ['GYM',"CALORIC INTAKE"],
        required: true
    },
    targetBody: {
        type: [String],
        enum: ["back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"]
    },
    startDate: { type: Date },  // When the goal was set
    endDate: { type: Date },  // Optional: deadline for the goal
    achieved: { type: Boolean, default: false },  // Whether the goal has been achieved
    calories: Number,  // Daily Limit
    caloriesConsumed: Number,
}, {
    timestamps: true,
    versionKey: false
});
GoalSchema.index({ userId: 1, goalType: 1 });
const GOAL = mongoose.model('Goal', GoalSchema);

module.exports = GOAL;