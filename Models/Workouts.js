const mongoose = require('mongoose');
const days = require('../assets/contants');

const workoutSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    status: { type: Boolean, default: false },
    completedOn: { type: Date }
}, { _id: false });

const workoutScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, enum: [...days], required: true },
    time: Number, // in milliseconds
    workout: { type: [workoutSchema], required: true } // Array of workouts
}, {
    timestamps: true,
    versionKey: false
});

workoutScheduleSchema.index(
    { userId: 1, day: 1, "workout.exerciseName": 1 },
    { unique: true }
);

const WORKOUT_SCHEDULE = mongoose.model('WORKOUT_SCHEDULE', workoutScheduleSchema);

module.exports = WORKOUT_SCHEDULE;
