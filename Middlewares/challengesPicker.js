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
            const today = new Date().setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
            const lastChallengeIssueDate = user.LastChallengeIssueDate ? 
                new Date(user.LastChallengeIssueDate).setHours(0, 0, 0, 0) : null;

            // If no challenges were issued today or LastChallengeIssueDate is null
            if (!lastChallengeIssueDate || lastChallengeIssueDate < today) {
                const limit = 2;

                // Generate random steps for challenges
                const steps1 = Math.floor(Math.random() * 200);
                const steps2 = Math.floor(Math.random() * 200);

                // Create challenge instances
                const challenge1 = new CHALLENGE({
                    description: `Take ${steps1} steps.`,
                    steps: steps1,
                    gymPoints: Math.floor(Math.random() * 100)
                });
                const challenge2 = new CHALLENGE({
                    description: `Take ${steps2} steps.`,
                    steps: steps2,
                    gymPoints: Math.floor(Math.random() * 100)
                });

                // Save both challenges to the database
                const savedChallenges = await Promise.all([challenge1.save(), challenge2.save()]);
                const challengeIDs = savedChallenges.map(challenge => challenge._id);

                // Update the user with the new challenges and issue date
                await USER.findByIdAndUpdate(userId, {
                    DailyChallenges: challengeIDs,
                    LastChallengeIssueDate: new Date() // Set to current date
                });

                // Send notification email if challenges were successfully created
                if (savedChallenges.length >= 2) {
                    const text = `Challenge 1: ${savedChallenges[0].description} (Gym Points: ${savedChallenges[0].gymPoints})\n` +
                        `Challenge 2: ${savedChallenges[1].description} (Gym Points: ${savedChallenges[1].gymPoints})`;
                    sendNotificationMail(user.email, "Complete your daily challenges!", text);
                }

                // Log the challenge creation and move to next middleware
                console.log({ message: `${limit} challenges have been issued to ${userId}`, challenges: savedChallenges });
                req.session.challengesPicked = true;
                next();
            } else {
                // Challenges already issued today
                req.session.challengesPicked = true;
                console.log({ message: "Challenges have already been issued for today" });
                next();
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error issuing challenges:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = challengesPicker;
