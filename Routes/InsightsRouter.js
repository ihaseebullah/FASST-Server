const { GetInsights, getUserInsights, getUserHealthInsights, getComprehensiveUserInsights } = require('../Controllers/Insights/GetInsights')
const { updateHydrationInsights, updateHydrationGoal } = require('../Controllers/Insights/Hydration')
const initializationOfInsights = require('../Controllers/Insights/Initalization')
const { updateStepsCount } = require('../Controllers/Insights/Steps')
const { INSIGHT } = require('../Models/Insights')
const USER = require('../Models/User')

const InsightsRouter = require('express').Router()
//Initalization
InsightsRouter.get('/insights/initalization/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await USER.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const insights = await INSIGHT.findById(user.INSIGHT);

        if (!insights) {
            // Set a default hydration record date to the current date to avoid null values
            const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

            const newInsight = new INSIGHT({
                userId,
                stepsGoal: 10000,
                hydrationGoal: 10,
                hydration: [{
                    date: currentDate, // Ensure date is unique and not null
                    glasses: 0,
                    lastGlassAt: null
                }]
            });

            await newInsight.save().then(async (savedInsight) => {
                await USER.findByIdAndUpdate(userId, { INSIGHT: savedInsight._id });
            });

            return res.status(200).json({ message: "Initialization successful" });
        } else {
            // Check existing hydration records for null dates and update them
            insights.hydration.forEach(record => {
                if (!record.date) {
                    record.date = new Date().toISOString().split('T')[0];
                }
            });
            await insights.save();

            return res.status(200).json({ message: "User insights already exist", insights });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
})
//Access All Insights
// InsightsRouter.get('/insights/:insightsId',GetInsights)
InsightsRouter.get('/insights/:userId', getComprehensiveUserInsights)
// Hydration
InsightsRouter.put('/insights/hydration/:userId', updateHydrationInsights)
InsightsRouter.put('/insights/hydration/update-hydration-goal/:userId/:goal', updateHydrationGoal)

// Steps
// Example Route: http://localhost:3000/api/insights/steps/update/66c627d74977d4901142ec49/135/66c3f8c2fcc3abca4a45e683
InsightsRouter.put('/insights/steps/update/:steps/:userId', updateStepsCount)
module.exports = InsightsRouter