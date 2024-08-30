const mongoose = require('mongoose');

const Meetup_Schema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "SOCIAL_USER" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "SOCIAL_USER" },
    location: String,
    date: Date,
    otherInformation: String,
    status: { type: String, enum: ['pending', 'accepted', 'declined','completed'], default: 'pending' }
}, { timestamps: true })

const MEETUP = mongoose.model('MEETUP', Meetup_Schema)

module.exports = MEETUP;