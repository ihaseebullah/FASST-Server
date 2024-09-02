const { INSIGHT } = require("../../Models/Insights");
const USER = require("../../Models/User");

const initializationOfInsights = async (req, res) => {
    console.log('req.params')
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
}

module.exports = initializationOfInsights;
