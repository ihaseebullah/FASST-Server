const GOAL = require("../../Models/Goals");

const recommendations = async (req, res) => {
    const { userId } = req.params
    try {
        const Goals = await GOAL.findOne({ userId: userId, goalType: "GYM" }, { targetBody: 1 })
        console.log(Goals)
        res.json(Goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
}

module.exports = recommendations;