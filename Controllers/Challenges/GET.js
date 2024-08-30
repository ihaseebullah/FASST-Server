const CHALLENGE = require("../../Models/Challenges");
const USER = require("../../Models/User");
const { sendNotificationMail } = require('../../Utils/sendMail')
const getRandomChallenge = async (req, res) => {
    const { limit, userId } = req.params;
    try {
        if (userId) {
            const user = await USER.findById(userId);
            if (new Date(user.LastChallengeIssueDate).toLocaleDateString < new Date(user.LastChallengeIssueDate).toLocaleDateString) {
                const challenges = await CHALLENGE.aggregate([
                    { $sample: { size: parseInt(limit) } }
                ]);
                const IDs = challenges.map(challenge => challenge._id);
                await USER.findByIdAndUpdate(userId, { DailyChallenges: IDs, LastChallengeIssueDate: new Date() }).then((user) => {
                    const text = `Challenge 1: ${challenges[0].description} Gym Points:${challenges[0].gymPoints}
                    Challenge 2: ${challenges[1].description} Gym Points:${challenges[1].gymPoints}`
                    sendNotificationMail(user.email, "Complete your daily challenges!", text)
                })
                res.status(201).json({ message: `${limit} workouts has been issued to ${userId}`, challenges: [...challenges] })
            }
        } else {
            const challenges = await CHALLENGE.aggregate([
                { $sample: { size: parseInt(limit) } }
            ]);
            res.json(challenges);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
}


const challengeCompletion = async (req, res) => {
    const { challengeId, userId } = req.params;

    try {
        const [challenge, user] = await Promise.all([
            CHALLENGE.findById(challengeId),
            USER.findById(userId)
        ]);

        if (!challenge || !user) {
            return res.status(404).json({ error: 'Challenge or User not found' });
        }

        // Current date and formatted dates for comparison
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        const lastCompletedDateString = user.lastChallengeCompletedOn ? user.lastChallengeCompletedOn.toISOString().split('T')[0] : null;

        // Check if the user is completing a challenge today that wasn't completed before
        if (lastCompletedDateString !== todayString) {
            // Check if the challenge is due today (or on a daily basis)
            const isChallengeDueToday = user.DailyChallenges.includes(challengeId);

            if (isChallengeDueToday) {
                // Calculate the difference in days between lastCompletedDate and today
                const lastCompletedDate = new Date(user.lastChallengeCompletedOn);
                const diffInTime = today.getTime() - lastCompletedDate.getTime();
                const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

                if (diffInDays === 2) {
                    // Increment the streak if the difference is exactly 2 days
                    user.streak.count += 1;
                } else {
                    // Reset the streak if the difference is not 2 days
                    user.streak.count = 1;
                }

                // Update the last challenge completion date
                user.lastChallengeCompletedOn = today;
            } else {
                // If the challenge is not due today, reset the streak
                user.streak.count = 0;
            }
        }

        // Remove the challenge from DailyChallenges and add to ChallengesCompleted
        user.DailyChallenges.pull(challengeId);
        user.ChallengesCompleted.push(challengeId);
        user.GYM_POINTS += challenge.gymPoints;

        // Save the user and return the response
        await user.save().then((savedUser) => {
            res.json({
                user: savedUser,
                streak: user.streak.count, // Return the current streak count
                lastChallengeCompletedOn: user.lastChallengeCompletedOn, // Return the last challenge completed date
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};
module.exports = { getRandomChallenge, challengeCompletion };
