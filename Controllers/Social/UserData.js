const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");

const InitializeApp = async (req, res) => {
    try {
        const { userId, username, profilePic, firstName, lastName, bio, visibility } = req.body;
        const user = await USER.findById(userId);
        const newUser = new SOCIAL_USER({
            userId, username, profilePic, firstName, lastName, bio, prefrences: { visibility: visibility ? visibility : 'public' }
        })
        await newUser.save().then(async (social_user) => {
            user.SOCIAL_USER = social_user._id
            await user.save();
            return res.status(201).json({ message: "Social User Created Successfully", social_user });
        })
    } catch (err) {
        if (err.code == 11000) return res.status(400).json({ message: err.keyValue.username + " already reserved!" });
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const GetSocialUser = async (req, res) => {
    try {
        console.log(req.params.socialUserId)
        const socialUser = await SOCIAL_USER.findById(req.params.socialUserId);
        console.log(socialUser)
        if (!socialUser) return res.status(404).json({ message: "User not found. Create Now!" });
        res.json(socialUser);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const EditUser = async function (req, res) {
    try {
        const { socialUserId } = req.params;
        const { username, profilePic, firstName, lastName, bio, profileVisibility } = req.body;
        console.log(req.body)
        const socialUser = await SOCIAL_USER.findById(socialUserId);
        socialUser.username = username ? username : socialUser.username
        socialUser.profilePic = profilePic ? profilePic : socialUser.profilePic
        socialUser.firstName = firstName ? firstName : socialUser.firstName
        socialUser.lastName = lastName ? lastName : socialUser.lastName
        socialUser.bio = bio ? bio : socialUser.bio
        socialUser.prefrences.visibility = profileVisibility,
            await socialUser.save().then((savedUser) => {
                res.json(savedUser);
            })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

const updateLocation = async function (req, res) {
    try {
        const { socialUserId } = req.params;
        const { location } = req.body;
        const socialUser = await SOCIAL_USER.findByIdAndUpdate(socialUserId, { prefrences: { location: location } });
        res.json(socialUser);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

const getUsersLocations = async (req, res) => {
    console.log(req.params)
    try {
        const { userId } = req.params;
        const users = await SOCIAL_USER.find(
            {
                userId: { $ne: userId },
                'prefrences.visibility': true,
                'prefrences.location': { $exists: true, $ne: null }
            },
            { firstName: 1, lastName: 1, profilePic: 1, 'prefrences.location': 1, _id: 1 }
        ).lean();
        const locations = users.map((user) => {
            return {
                id: user._id,
                profilePic: user.profilePic,
                name: `${user.firstName} ${user.lastName}`,
                latitude: user.prefrences.location.latitude,
                longitude: user.prefrences.location.longitude
            };
        });
        res.json(locations);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { InitializeApp, GetSocialUser, EditUser, updateLocation, getUsersLocations };