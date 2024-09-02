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

        // Find the workout schedule for the specific user and day
        let workoutSchedule = await WORKOUT_SCHEDULE.findOne({ userId, day });

        // Function to check if the day has changed since the last update
        const isDifferentDay = (lastUpdated) => {
            const now = new Date();
            const lastUpdateDate = new Date(lastUpdated);
            return now.getDate() !== lastUpdateDate.getDate() ||
                now.getMonth() !== lastUpdateDate.getMonth() ||
                now.getFullYear() !== lastUpdateDate.getFullYear();
        };

        // Check if workout schedule exists and needs resetting
        if (workoutSchedule && isDifferentDay(workoutSchedule.updatedAt)) {
            // Reset all workout status to false
            await WORKOUT_SCHEDULE.updateOne(
                { _id: workoutSchedule._id },
                { $set: { 'workout.$[].status': false } }
            );

            // Update the workoutSchedule object to get the latest data after update
            workoutSchedule = await WORKOUT_SCHEDULE.findById(workoutSchedule._id);
        }

        // Retrieve daily challenges for the user
        const challengesId = await USER.findById(userId, { DailyChallenges: 1 });
        const challenges = await CHALLENGE.find({ _id: { $in: challengesId.DailyChallenges } });

        // If no workout schedule is found, return 404
        if (!workoutSchedule) {
            return res.status(404).json({ message: "No workout schedule found for today." });
        }

        // Return the updated workout schedule and challenges
        return res.status(200).json({ workoutSchedule, challenges });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { ScheduleWorkouts, markExerciseComplete, getExersices };
