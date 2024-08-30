const POST = require("../../Models/Posts");

const react = async (req, res) => {
    try {
        const { SOCIAL_USER, postId } = req.body;
        await POST.findByIdAndUpdate(postId, { $push: { reacts: SOCIAL_USER } })
        res.status(200)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
}

module.exports = { react }