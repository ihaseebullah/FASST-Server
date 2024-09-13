const FOOD = require("../../Models/Food");
const HEALTH_MATRICS = require("../../Models/HealthMetrics");
const { INSIGHT } = require("../../Models/Insights");
const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");

const GetInsights = async (req, res) => {
    try {
        const { insightsId } = req.params;
        const Insights = await INSIGHT.findById(insightsId).populate('STEPS_RECORD FOOD')
        if (!Insights) {
            return res.status(404).json({ error: "Insights not found" })  // 404 Not Found if Insights not found in DB.
        }
        res.json(Insights)
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" })
    }
}


const getComprehensiveUserInsights = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch the user and populate the related insights, workout, and health metrics data
        const user = await USER.findById(userId)
            .populate({
                path: 'INSIGHT',
                populate: [
                    { path: 'STEPS_RECORD', options: { sort: { _id: -1 }, limit: 1 } },  // Populate steps record
                    { path: 'FOOD' },           // Populate food data
                ]
            })
            .populate('WORKOUTS') // Populate workout schedules
            .populate('HEALTH_MATRICS'); // Populate health metrics
        const socialUser = await SOCIAL_USER.findById(user.SOCIAL_USER)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const insights = user.INSIGHT;
        const workoutSchedules = user.WORKOUTS;
        const healthMetrics = user.HEALTH_MATRICS;

        if (!insights) {
            return res.status(404).json({ message: 'No insights found for this user' });
        }

        // Calculate total water intake and compare with hydration goal
        const totalWaterIntake = insights.hydration.reduce((acc, record) => acc + record.glasses, 0);
        const hydrationProgress = (totalWaterIntake / insights.hydrationGoal) * 100;

        // Calculate total steps and compare with steps goal
        const totalSteps = insights.STEPS_RECORD.reduce((acc, record) => acc + record.steps, 0);
        const stepsProgress = (totalSteps / insights.stepsGoal) * 100;
        // Workout completion status
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayWorkout = workoutSchedules.find(workout => workout.day === today);
        const completedWorkouts = todayWorkout ? todayWorkout.workout.filter(w => w.status).length : 0;
        const totalWorkouts = todayWorkout ? todayWorkout.workout.length : 0;
        const workoutCompletionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

        // Fetch the highest and lowest calorie consumption from the Food collection
        const foodRecords = await FOOD.find({ userId });
        const healthMatrics = await HEALTH_MATRICS.findById(user.HEALTH_MATRICS)
        // Calculate the highest and lowest calorie consumption
        const highestCalorieConsumption = Math.max(...foodRecords.map(record => record.caloriesConsumed));
        const lowestCalorieConsumption = Math.min(...foodRecords.map(record => record.caloriesConsumed));

        // Calculate the total calorie consumption for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCalorieConsumption = foodRecords
            .filter(record => new Date(record.date) >= sevenDaysAgo)
            .reduce((acc, record) => acc + record.caloriesConsumed, 0);

        // Get the total calories to consume from health metrics
        const totalCaloriesToConsume = healthMetrics ? healthMetrics.totallCaloriesToConsume : 0;

        // Prepare response data
        const response = {
            hydration: {
                totalWaterIntake,
                hydrationGoal: insights.hydrationGoal,
                hydrationProgress,
                lastGlassAt: insights.hydration[insights.hydration.length - 1]?.lastGlassAt || null,
            },
            steps: {
                totalSteps,
                stepsGoal: insights.stepsGoal,
                stepsProgress,
            },
            calories: {
                highestCalorieConsumption,
                lowestCalorieConsumption,
                totalCaloriesToConsume,
                recentCalorieConsumption,
                calorieBalance: totalCaloriesToConsume - highestCalorieConsumption, // Example balance
            },
            streak: {
                currentStreak: user.streak.count,
                lastUpdated: user.streak.updatedAt,
            },
            workout: {
                totalWorkouts,
                completedWorkouts,
                workoutCompletionRate,
            },
            prefrences: user.RECIPE_PREFRENCES,
            healthMatrics: healthMatrics
        };

        res.status(200).json({ socialUser: socialUser, insights: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { GetInsights, getComprehensiveUserInsights }