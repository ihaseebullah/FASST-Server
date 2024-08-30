const GOAL = require("../../Models/Goals");
const USER = require("../../Models/User");

const createGoal = async (req, res) => {
    try {
        const { userId, goalType, targetBody, startDate, endDate, calories } = req.body;
        const user = await USER.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            if (goalType == "GYM") {
                const newGoal = new GOAL({
                    userId, goalType, targetBody, startDate, endDate
                })
                await newGoal.save().then(async (goal) => {
                    user.GOALS.push(goal._id);
                    await user.save().then((user) => {
                        return res.status(201).json({ message: 'Goal saved successfully', goal, user })
                    })
                })
            } else {
                const newGoal = new GOAL({
                    userId, goalType, startDate, endDate, calories
                })
                await newGoal.save().then(async (goal) => {
                    user.GOALS.push(goal._id);
                    user.totallCalories = goal.calories;
                    await user.save().then((user) => {
                        return res.status(201).json({ message: 'Goal saved successfully', goal, user })
                    })

                })
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
    }
}

const getGoals = async (req, res) => {
    try {
        const goals = await GOAL.find({ userId: req.params.userId });
        res.json(goals);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
    }
}

const editGoal = async (req, res) => {
    const { targetBody, startDate, endDate, calories } = req.body;
    try {
        const goal = await GOAL.findByIdAndUpdate(req.params.goalId, { targetBody, startDate, endDate, calories }, { new: true });
        await USER.findByIdAndUpdate(goal.userId, { totallCalories: calories && calories })
        res.status(200).json(goal);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
    }
}
module.exports = { createGoal, getGoals, editGoal };