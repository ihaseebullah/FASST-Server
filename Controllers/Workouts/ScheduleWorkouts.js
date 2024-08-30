const days = require("../../assets/contants");
const CHALLENGE = require("../../Models/Challenges");
const USER = require("../../Models/User");
const WORKOUT_SCHEDULE = require("../../Models/Workouts");

const ScheduleWorkouts = async (req, res) => {
    try {
        const { userId, day, exercises, time } = req.body;
        const user = await USER.findById(userId);
        let workoutSchedule = await WORKOUT_SCHEDULE.findOne({ userId, day: day });
        const exercisesSaved = [];
        const exercisesRejected = [];
        if (!workoutSchedule) {
            // Create a new workout schedule if it doesn't exist
            workoutSchedule = new WORKOUT_SCHEDULE({
                userId,
                day: day,
                time
            });
            workoutSchedule = await workoutSchedule.save();
            exercises.forEach(exercise => {
                workoutSchedule.workout.push({ exerciseName: exercise });
                exercisesSaved.push(exercise);
            });

            workoutSchedule = await workoutSchedule.save();

            // Update the user's WORKOUTS field
            user.WORKOUTS.push(workoutSchedule._id);
            await user.save();

            return res.status(201).json({
                message: "Workout schedule created successfully.",
                exercisesSaved,
                exercisesRejected
            });
        } else {
            // Filter out duplicate exercises
            exercises.forEach(exercise => {
                const isDuplicate = workoutSchedule.workout.some(
                    w => w.exerciseName.toLowerCase() === exercise.toLowerCase()
                );
                if (isDuplicate) {
                    exercisesRejected.push(exercise);
                } else {
                    workoutSchedule.workout.push({ exerciseName: exercise });
                    exercisesSaved.push(exercise);
                }
            });

            await workoutSchedule.save();

            return res.status(200).json({
                message: "Workout schedule updated successfully.",
                exercisesSaved,
                exercisesRejected
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const markExerciseComplete = async (req, res) => {
    try {
        const { userId, exerciseName, day } = req.params;
        const workoutSchedule = await WORKOUT_SCHEDULE.findOne({ userId, day: days[new Date().getDay()] });
        if (!workoutSchedule) {
            return res.status(404).json({ message: "No workout schedule found for today." });
        }
        const exercise = workoutSchedule.workout.find(
            workout => workout.exerciseName.toLowerCase() === exerciseName.toLowerCase()
        );
        if (!exercise) {
            return res.status(404).json({ message: `Exercise '${exerciseName}' not found in today's schedule.` });
        }
        exercise.status = true;
        exercise.completedOn = new Date().toLocaleDateString();
        await workoutSchedule.save();

        return res.status(200).json({ message: `Exercise '${exerciseName}' marked as complete.`, workoutSchedule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getExersices = async (req, res) => {
    try {
        const { userId, day } = req.params;
        const workoutSchedule = await WORKOUT_SCHEDULE.findOne({ userId, day: day });
        const challengesId = await USER.findById(userId, { DailyChallenges: 1 })
        const challenges = await CHALLENGE.find({ _id: [...challengesId.DailyChallenges] })
        console.log(challenges)
        if (!workoutSchedule) {
            return res.status(404).json({ message: "No workout schedule found for today." });
        }
        return res.status(200).json({ workoutSchedule, challenges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = { ScheduleWorkouts, markExerciseComplete, getExersices };
