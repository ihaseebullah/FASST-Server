const mongoose = require('mongoose');
const cron = require('node-cron');
const WORKOUT_SCHEDULE = require('../Models/Workouts');

// Connect to your MongoDB database
mongoose.connect(process.env.ConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
    console.log('Cron Scheduler started');

    // Schedule the cron job to run daily at midnight
    cron.schedule('47 2 * * *', async () => {
        try {
            console.log('Resetting workout statuses to false...');

            await WORKOUT_SCHEDULE.updateMany(
                { 'workout.status': true },
                { $set: { 'workout.$[].status': false } }
            );

            console.log('Workout statuses have been reset.');
        } catch (err) {
            console.error('Error resetting workout statuses:', err);
        }
    });
});

module.exports = mongoose;

