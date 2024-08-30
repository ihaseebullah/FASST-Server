const CHALLENGE = require("../Models/Challenges");
const USER = require("../Models/User");
const { sendNotificationMail } = require("../Utils/sendMail");

const challengesPicker = async (req, res, next) => {
    try {
        if (req.session.challengesPicked) {
            return next();
        }
        if (req.isAuthenticated()) {
            const userId = req.user._id;
            const user = await USER.findById(userId);
            const today = new Date().toLocaleDateString();
            const lastChallengeIssueDate = new Date(user.LastChallengeIssueDate).toLocaleDateString();
            if (lastChallengeIssueDate < today || !user.LastChallengeIssueDate) {
                const limit = 2;
                const challenges = await CHALLENGE.aggregate([
                    { $sample: { size: parseInt(limit) } }
                ]);
                const IDs = challenges.map(challenge => challenge._id);
                await USER.findByIdAndUpdate(userId, {
                    DailyChallenges: IDs,
                    LastChallengeIssueDate: new Date()
                });
                if (challenges.length >= 2) {
                    const text = `Challenge 1: ${challenges[0].description} Gym Points: ${challenges[0].gymPoints}\n` +
                        `Challenge 2: ${challenges[1].description} Gym Points: ${challenges[1].gymPoints}`;
                    sendNotificationMail(user.email, "Complete your daily challenges!", text);
                }
                console.log({ message: `${limit} challenges have been issued to ${userId}`, challenges });
                req.session.challengesPicked = true;
                next()
            } else {
                req.session.challengesPicked = true;
                console.log({ message: "Challenges have already been issued for today" });
                next()
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = challengesPicker;
