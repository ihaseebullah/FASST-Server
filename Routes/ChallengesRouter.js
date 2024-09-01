const { getRandomChallenge, challengeCompletion } = require('../Controllers/Challenges/GET')
const USER = require('../Models/User')

const ChallengesRouter = require('express').Router()


ChallengesRouter.get('/challenges/random/:limit/:userId', getRandomChallenge)
ChallengesRouter.put('/challenges/completion/:challengeId/:userId', challengeCompletion)
ChallengesRouter.get('/challenges/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const challenges = await USER.findById(userId).populate('DailyChallenges ChallengesCompleted')
    res.json({ challenges: challenges.DailyChallenges, completed: challenges.ChallengesCompleted })
})

module.exports = { ChallengesRouter }