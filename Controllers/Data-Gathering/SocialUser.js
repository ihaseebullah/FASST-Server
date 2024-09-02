const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");

const createSocialProfile = async (req, res) => {
    const { username, gender, firstName, lastName, bio, userId } = req.body;
    try {
        const existingUser = await SOCIAL_USER.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const initalizeSocialPlatform = new SOCIAL_USER({
            username: username,
            userId: userId,
            profilePic: gender === "female"
                ? 'https://res.cloudinary.com/dwe2jadmh/image/upload/v1724691754/uqn0o7gsto2nw6jhngom.png'
                : "https://res.cloudinary.com/dwe2jadmh/image/upload/v1724691753/k61qztl9o2jcfcbln9yn.png",
            firstName: firstName,
            lastName: lastName,
            bio: bio,
            meet_up_requests: [],
            prefrences: {
                visibility: true,
            }
        });

        await initalizeSocialPlatform.save().then(async (socialUser) => {
            await USER.findByIdAndUpdate(userId, { SOCIAL_USER: socialUser._id }).then((saved) => {
                return res.status(201).json(saved);
            })
        });


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = createSocialProfile;
