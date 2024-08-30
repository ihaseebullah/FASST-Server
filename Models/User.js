const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: String,
    DailyChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CHALLENGE' }],
    ChallengesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CHALLENGE' }],
    GYM_POINTS: { type: Number, default: 0 },
    calories: Number,
    diet_type: String,
    LastChallengeIssueDate: Date,
    HEALTH_MATRICS: { type: mongoose.Schema.Types.ObjectId, ref: "HEALTH_MATRICS" },
    SOCIAL_USER: { type: mongoose.Schema.Types.ObjectId, ref: "SOCIAL_USER" },
    GOALS: [{ type: mongoose.Schema.Types.ObjectId, ref: "GOALS" }],
    WORKOUTS: [{ type: mongoose.Schema.Types.ObjectId, ref: "WORKOUT_SCHEDULE" }],
    INSIGHT: { type: mongoose.Schema.Types.ObjectId, ref: "INSIGHT" },
    // FOOD: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }], // Moved to Insight Schema
    OTP: { type: String, default: "AU-" + Math.floor(100000 + Math.random() * 900000).toString(), expires: '30m' },
    isVerified: { type: Boolean, default: false },
    VFCP: { type: Boolean, default: false }, // Verified for change password
    RECIPE_PREFRENCES: {
        dietaryPreference: String,
        healthGoal: String,
        cuisinePreference: String,
        mealsPerDay: String,
        allergies: String
    },
    streak: { count: { type: Number, default: 0 }, updatedAt: Date },
    lastChallengeCompletedOn: Date

}, {
    timestamps: true,
    versionKey: false
});
UserSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const USER = mongoose.model('USER', UserSchema);

module.exports = USER;
