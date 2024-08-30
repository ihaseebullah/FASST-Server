const mongoose = require('mongoose');

const SocialUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
    username: { type: String, required: true, unique: true },
    profilePic: String,
    firstName: String,
    lastName: String,
    bio: String,
    prefrences: {
        visibility: { type: Boolean, default: false },
        location: Object
    }, meet_up_requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "MEETUP" }]
}, {
    timestamps: true,
    versionKey: false
})

const SOCIAL_USER = mongoose.model("SOCIAL_USER", SocialUserSchema)

module.exports = SOCIAL_USER;