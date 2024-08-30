const MEETUP = require("../../Models/Meetups");
const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");
const { sendNotificationMail } = require("../../Utils/sendMail");

const createMeetup = async (req, res) => {
    try {
        const { socialUserId, to, otherInformation, location, date } = req.body;
        const newMeetup = new MEETUP({
            from: socialUserId,
            to: to,
            location: location,
            otherInformation: otherInformation,
            date
        });
        const savedMeetup = await newMeetup.save();
        const socialUser = await SOCIAL_USER.findByIdAndUpdate(socialUserId, {
            $push: { meet_up_requests: savedMeetup._id }
        });
        console.log(socialUser);
        if (!socialUser) {
            return res.status(404).json({ error: "Social user not found" });
        }
        const rootUser = await USER.findOne({ SOCIAL_USER: to });
        await SOCIAL_USER.findByIdAndUpdate(rootUser.SOCIAL_USER, { $push: { meet_up_requests: savedMeetup._id } }, { new: true });
        console.log(rootUser);
        if (!rootUser) {
            return res.status(404).json({ error: "Root user not found" });
        }
        const emailSubject = `Meetup Request by ${socialUser.firstName} ${socialUser.lastName}`;
        const emailBody = `
            Hello ${socialUser.firstName},

            You have received a new meetup request from ${socialUser.firstName} ${socialUser.lastName}.
            Location: ${location}
            Additional Information: ${otherInformation}

            Please log in to your account to view more details and respond to the request.

            Best regards,
            Fast App Team
        `;
        sendNotificationMail(rootUser.email, emailSubject, emailBody);
        res.status(200).json({ message: "Meetup created and notification sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

const getMeetups = async (req, res) => {
    try {
        const { socialId } = req.params;

        const meetups = await MEETUP.find({
            $or: [
                { to: socialId },
                { from: socialId }
            ]
        }).populate("from");

        res.json(meetups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

// New Controller Function to Update Meetup Status
const updateMeetupStatus = async (req, res) => {
    try {
        const { meetupId, status } = req.params;

        const validStatuses = ['pending', 'accepted', 'declined', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updatedMeetup = await MEETUP.findByIdAndUpdate(
            meetupId,
            { status },
            { new: true }
        );

        if (!updatedMeetup) {
            return res.status(404).json({ error: "Meetup not found" });
        }

        const toUser = await SOCIAL_USER.findById(updatedMeetup.to);
        const fromUser = await SOCIAL_USER.findById(updatedMeetup.from);

        if (toUser && fromUser) {
            const emailSubject = `Meetup Status Updated to ${status}`;
            const emailBody = `
                Hello ${toUser.firstName},

                The status of your meetup with ${fromUser.firstName} ${fromUser.lastName} has been updated to "${status}".

                Please log in to your account to view more details.

                Best regards,
                Fast App Team
            `;
            sendNotificationMail(toUser.email, emailSubject, emailBody);
        }

        res.status(200).json(updatedMeetup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { createMeetup, getMeetups, updateMeetupStatus };
