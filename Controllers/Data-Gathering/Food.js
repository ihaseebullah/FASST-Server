const FOOD = require("../../Models/Food");
const { INSIGHT } = require("../../Models/Insights");
const USER = require("../../Models/User");

const foodIntake = async (req, res) => {
    try {
        const { userId, foodName, foodCalories, foodId, servingSize } = req.body;
        const user = await USER.findById(userId);
        const insights = await INSIGHT.findById(user.INSIGHT);
        const existingFoodObject = await FOOD.findOne({ date: new Date().toLocaleDateString(), userId });

        if (existingFoodObject) {
            existingFoodObject.foods.push({ name: foodName, calories: parseInt(foodCalories), foodId: foodId, servingSize: servingSize });
            existingFoodObject.caloriesConsumed += parseInt(foodCalories);
            await existingFoodObject.save();
            return res.status(201).json(existingFoodObject);
        } else {
            const foodObjectForToday = new FOOD({
                date: new Date().toLocaleDateString(),
                foods: [{ name: foodName, calories: parseInt(foodCalories), foodId: foodId, servingSize: servingSize }],
                caloriesConsumed: parseInt(foodCalories),
                userId: userId
            });
            await foodObjectForToday.save();
            insights.FOOD.push(foodObjectForToday._id);
            await insights.save();
            return res.status(201).json(foodObjectForToday);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
    }
};

const getFoodForLastWeek = async function (req, res) {
    const { userId } = req.params;
    try {
        const foodData = await FOOD.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(7);

        console.log(foodData);
        return res.json(foodData);
    } catch (e) {
        console.error("Error fetching food data:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { foodIntake, getFoodForLastWeek };
