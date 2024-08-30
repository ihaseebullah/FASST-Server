const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    SOCIAL_USER: { type: mongoose.Schema.Types.ObjectId, ref: 'SOCIAL_USER', required: true },
    media: { caption: String, image: String },
    reacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SOCIAL_USER' }]
})

const POST = mongoose.model('POST', PostSchema)

module.exports = POST;