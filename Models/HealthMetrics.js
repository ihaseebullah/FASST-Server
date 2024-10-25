const mongoose = require('mongoose')

const HealthMetricsScehma = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
    height: Number, // in cm,
    weight: Number, // in kg,
    bmi: { type: Number, get: (value) => Math.round(value) }, // calculated field
    totallCaloriesToConsume: Number,
    gender: String,
    age: Number,
    activityLevel: { type: Number, enum: [1.2, 1.375, 1.55, 1.725, 1.9] },
    macronutrients: {
        protein: Number,
        carbs: Number,
        fat: Number
    }
}, {
    timestamps: true,
    versionKey: false
})

const HEALTH_MATRICS = mongoose.model('HEALTH_MATRICS', HealthMetricsScehma)

module.exports = HEALTH_MATRICS