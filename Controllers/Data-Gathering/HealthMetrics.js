const HEALTH_MATRICS = require("../../Models/HealthMetrics");
const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");
const initialization = require("../Insights/Initalization");

const calculateBMR = (gender, weight, height, age, activityLevel) => {
    let bmr;

    // BMR calculation using the Mifflin-St Jeor Equation
    if (gender == 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender == 'female') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
        throw new Error('Invalid gender');
    }

    // Adjust BMR based on activity level
    return bmr * activityLevel;
};

const PostHealthMetrics = async (req, res) => {
    const { userId, height, weight, gender, age, activityLevel, goal } = req.body;
    console.log(req.body)
    try {
        const parsedHeight = parseFloat(height) * 100;
        const parsedWeight = parseFloat(weight);
        const bmi = parsedWeight / Math.pow(parsedHeight / 100, 2) // height is converted to meters for BMI
        const bmr = goal === "increase" ? calculateBMR(gender, parsedWeight, parsedHeight, age, activityLevel) + 500 : goal === "maintain" ? calculateBMR(gender, parsedWeight, parsedHeight, age, activityLevel) : (calculateBMR(gender, parsedWeight, parsedHeight, age, activityLevel) - 500);
        initialization()
        const healthMetrics = new HEALTH_MATRICS({
            userId,
            height: parsedHeight,
            weight: parsedWeight,
            gender,
            age,
            bmi: bmi.toFixed(2),
            totallCaloriesToConsume: bmr.toFixed(2),
            activityLevel,
        });

        await healthMetrics.save().then(async (savedMetrics) => {
            await USER.findByIdAndUpdate(userId, { HEALTH_MATRICS: savedMetrics._id, calories: bmr.toFixed(2) }).then(async (user) => {
                res.status(201).json(user);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

const updateHealthMetrics = async (req, res) => {
    try {
        const { userId, height, weight, gender, age, activityLevel } = req.body;
        const parsedHeight = parseFloat(height) * 100;
        const parsedWeight = parseFloat(weight);
        const bmi = parsedWeight / Math.pow(parsedHeight / 100, 2) // height is converted to meters for BMI
        const bmr = calculateBMR(gender, parsedWeight, parsedHeight, age, activityLevel);

        const updatedMetrics = await HEALTH_MATRICS.findOneAndUpdate(
            { userId },
            {
                height: parsedHeight,
                weight: parsedWeight,
                gender,
                age,
                bmi: bmi.toFixed(2),
                totallCaloriesToConsume: bmr.toFixed(2),
                activityLevel,
            },
            { new: true }
        );

        if (!updatedMetrics) return res.status(404).json({ message: 'Health Metrics not found' });

        await USER.findByIdAndUpdate(userId, { calories: bmr.toFixed(2) });

        res.json(updatedMetrics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};
const getHealthMetrics = async (req, res) => {
    try {
        const { userId } = req.params;
        const healthMetrics = await HEALTH_MATRICS.findOne({ userId });
        res.json(healthMetrics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
}
module.exports = { PostHealthMetrics, updateHealthMetrics, getHealthMetrics };