const { INSIGHT } = require("../../Models/Insights");
const USER = require("../../Models/User");

// Helper function to format the date as MM/DD/YYYY
function formatDate(date) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

const updateHydrationInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = formatDate(new Date());
        const user = await USER.findById(userId);
        let insights = await INSIGHT.findOne({ userId });
        if (!insights) {
            insights = new INSIGHT({
                userId,
                hydrationGoal: req.body.hydrationGoal || 8
            });
        }
        let todayRecord = insights.hydration.find(record => record.date === today);
        if (!todayRecord) {
            todayRecord = {
                date: today,
                glasses: 1,
                lastGlassAt: new Date()
            };
            insights.hydration.push(todayRecord);
        } else {
            todayRecord.glasses += 1;
            todayRecord.lastGlassAt = new Date();
        }
        await insights.save().then(async (i) => {
            user.INSIGHT= i._id
            await user.save()
        })
        return res.status(200).json({
            hydrationGoal: insights.hydrationGoal,
            todayRecord
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};


const updateHydrationGoal = async (req, res) => {
    try {
        const { userId, goal } = req.params;
        const parsedGoal = parseInt(goal);
        if (isNaN(parsedGoal) || parsedGoal <= 0) {
            return res.status(400).json({ error: 'Invalid goal. Goal must be a positive number.' });
        }
        const insights = await INSIGHT.findOneAndUpdate(
            { userId },
            { hydrationGoal: parsedGoal },
            { new: true, upsert: true }
        );
        return res.status(200).json({ message: 'Hydration goal updated successfully', insights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
}


module.exports = { updateHydrationInsights, updateHydrationGoal };