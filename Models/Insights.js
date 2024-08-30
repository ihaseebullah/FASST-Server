const mongoose = require("mongoose");

const HydrationRecordSchema = new mongoose.Schema({
    date: { type: String, required: true, default: () => new Date().toISOString().split('T')[0] },
    glasses: { type: Number, default: 0 },
    lastGlassAt: { type: Date }
});


const StepsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
    date: { type: String, required: true },
    steps: { type: Number, required: true },
}, { expires: '1mo' })


// Insights Schema
const InsightsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
    hydrationGoal: { type: Number, default: 8 },
    hydration: [HydrationRecordSchema],
    exercise: { type: Number, default: 0 },
    STEPS_RECORD: [{ type: mongoose.Schema.Types.ObjectId, ref: "STEPS_RECORD" }],
    stepsGoal: { type: Number, default: 0 },
    calories: Number,
    caloriesConsumed: Number,
    streak: { count: { type: Number, default: 0 }, updatedAt: Date },
    FOOD: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }]
}, {
    timestamps: true,
    versionKey: false,
});
InsightsSchema.pre('save', function (next) {
    if (this.STEPS?.length > 30) {
        this.STEPS.shift(); // Removes the first element from the array
    }
    next();
});
const STEPS_RECORD = mongoose.model("STEPS_RECORD", StepsSchema)
const INSIGHT = mongoose.model("INSIGHT", InsightsSchema);


module.exports = { INSIGHT, STEPS_RECORD };