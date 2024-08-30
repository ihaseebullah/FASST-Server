const { GetInsights, getUserInsights, getUserHealthInsights, getComprehensiveUserInsights } = require('../Controllers/Insights/GetInsights')
const { updateHydrationInsights, updateHydrationGoal } = require('../Controllers/Insights/Hydration')
const initalization = require('../Controllers/Insights/Initalization')
const { updateStepsCount } = require('../Controllers/Insights/Steps')

const InsightsRouter = require('express').Router()
//Initalization
InsightsRouter.get('/insights/initalization/:userId',initalization)
//Access All Insights
// InsightsRouter.get('/insights/:insightsId',GetInsights)
InsightsRouter.get('/insights/:userId',getComprehensiveUserInsights)
// Hydration
InsightsRouter.put('/insights/hydration/:userId', updateHydrationInsights)
InsightsRouter.put('/insights/hydration/update-hydration-goal/:userId/:goal', updateHydrationGoal)

// Steps
// Example Route: http://localhost:3000/api/insights/steps/update/66c627d74977d4901142ec49/135/66c3f8c2fcc3abca4a45e683
InsightsRouter.put('/insights/steps/update/:steps/:userId',updateStepsCount)
module.exports = InsightsRouter