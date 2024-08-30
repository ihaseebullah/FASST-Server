const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true, 
    },
    gymPoints: {
        type: Number,
        required: true 
    },
    status: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started'
    }
}, { timestamps: true });
const CHALLENGE = mongoose.model('CHALLENGE', ChallengeSchema);

module.exports = CHALLENGE
