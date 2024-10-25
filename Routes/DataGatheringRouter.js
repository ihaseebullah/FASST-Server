const { foodIntake, getFoodForLastWeek } = require('../Controllers/Data-Gathering/Food');
const { PostHealthMetrics, updateHealthMetrics, getHealthMetrics } = require('../Controllers/Data-Gathering/HealthMetrics');
const { createGoal, editGoal } = require('../Controllers/Goals/Goals');
const DIET = require('../Models/Diets');
const FOOD_DATA = require('../Models/FoodData');
const USER = require('../Models/User');

const DataGatheringRouter = require('express').Router();

// Health Data Gathering
DataGatheringRouter.post('/init/data-gathering/health-matrix', PostHealthMetrics);
DataGatheringRouter.put('/update/data-gathering/health-matrix', updateHealthMetrics);
DataGatheringRouter.get('/get/data-gathering/health-matrix/:userId', getHealthMetrics);

// Food Data Gathering
DataGatheringRouter.post('/food-data-gathering/food-intake/', foodIntake);
DataGatheringRouter.get('/food-data-gathering/food-intake/:userId', getFoodForLastWeek);

// Goals Data Gathering
DataGatheringRouter.post('/goals-data-gathering/create-goal/', createGoal);
DataGatheringRouter.put('/goals-data-gathering/edit-goal/', createGoal);
DataGatheringRouter.get('/goals-data-gathering/get-goals/:goalId', editGoal);

// Search Food
DataGatheringRouter.get('/search/food/:foodName', async (req, res) => {
    const foodName = req.params.foodName;
    try {
        const regex = new RegExp(foodName, 'i');
        const food = await FOOD_DATA.find({
            Category: { $regex: regex }
            // { Description: { $regex: regex } }
        }, { Category: 1, Description: 1 }).limit(30);
        res.json(food);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while searching for food items.', error: err.message });
    }
});

DataGatheringRouter.get('/search/food/byId/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const food = await FOOD_DATA.findById(id);
        res.json(food);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while searching for food items.', error: err.message });
    }
});

DataGatheringRouter.put('/data-gathering/diet-plan/:userId', async (req, res) => {
    const id = req.params.userId;
    const {
        dietaryPreference,
        healthGoal,
        cuisinePreference,
        mealsPerDay,
        allergies

    } = req.body;
    try {
        await USER.findByIdAndUpdate(id, {
            RECIPE_PREFRENCES: {
                dietaryPreference,
                healthGoal,
                cuisinePreference,
                mealsPerDay,
                allergies
            }
        }).then((savedUser) => {
            console.log("New", savedUser)
            res.json(savedUser);
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while updating user diet plan', error: err.message });
    }
});


DataGatheringRouter.get('/recipes/food/recommendations/:userId', async (req, res) => {
    try {
        const user = await USER.findById(req.params.userId)
        const USER_PREFS = user.RECIPE_PREFRENCES
        const {
            dietaryPreference,
            healthGoal,
            cuisinePreference,
            mealsPerDay,
            allergies
        } = USER_PREFS;
        if (!dietaryPreference) {
            return res.status(200)
        }
        const highProteinThreshold = 20;
        const lowCarbThreshold = 15;
        let portionSizeAdjustment = 1; // Default adjustment for meals

        if (mealsPerDay === "2 large meals") {
            portionSizeAdjustment = 1.5; // Higher portion size for fewer meals
        } else if (mealsPerDay === "4-5 small meals") {
            portionSizeAdjustment = 0.75; // Smaller portion size for more meals
        }

        const pipeline = [];

        // Match based on dietary preference and cuisine
        pipeline.push({
            $match: {
                Diet_type: dietaryPreference.toLowerCase(),
                Cuisine_type: cuisinePreference.toLowerCase(),
            }
        });

        // Exclude recipes containing any of the specified allergens
        if ([allergies] && [allergies].length > 0 && allergies[0] != "None") {
            pipeline.push({
                $match: {
                    Ingredients: { $nin: [allergies].map(allergy => new RegExp(allergy, 'i')) }
                }
            });
        }

        // Apply additional filtering based on health goals
        if (healthGoal === "Muscle Gain") {
            pipeline.push({
                $match: {
                    "Protein(g)": { $gte: highProteinThreshold * portionSizeAdjustment }
                }
            });
            pipeline.push({
                $sort: { "Protein(g)": -1 }
            });
        } else if (healthGoal === "Weight Loss") {
            pipeline.push({
                $match: {
                    "Carbs(g)": { $lte: lowCarbThreshold * portionSizeAdjustment }
                }
            });
            pipeline.push({
                $sort: { "Carbs(g)": 1 }
            });
        } else if (healthGoal === "General Well-being") {
            pipeline.push({
                $match: {
                    "Protein(g)": { $gte: 10 * portionSizeAdjustment },
                    "Carbs(g)": { $gte: 10 * portionSizeAdjustment, $lte: 30 * portionSizeAdjustment },
                    "Fat(g)": { $gte: 5 * portionSizeAdjustment, $lte: 20 * portionSizeAdjustment }
                }
            });
        } else if (healthGoal === "Heart Health") {
            pipeline.push({
                $match: {
                    "Fat(g)": { $lte: 10 * portionSizeAdjustment }
                }
            });
        }

        // Limit to 7 results
        pipeline.push({
            $limit: 7
        });

        const recipes = await DIET.aggregate(pipeline);
        console.log(recipes)
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'An error occurred while searching for recipes.',
            error: err.message
        });
    }
});

module.exports = DataGatheringRouter;
