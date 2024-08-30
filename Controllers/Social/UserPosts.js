const POST = require("../../Models/Posts");
const SOCIAL_USER = require("../../Models/Social");
const USER = require("../../Models/User");

const CreatePost = async (req, res) => {
    try {
        const { socialUserId, caption, image } = req.body;
        const newPost = new POST({
            SOCIAL_USER: socialUserId,
            media: { caption: caption, image: image }
        })
        await newPost.save().then(async (saved_post) => {
            res.status(201).json(saved_post);
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server Error" });
    }
    // PAYLOAD
    //     {
    //         userId: "USER_ID",
    //         media: { caption: "Image 1 caption", image: "Image 1 link" }
    //     }
}


const GetPosts = async function (req, res) {
    const { socialUserId } = req.params;
    try {
        const posts = await POST.find({ SOCIAL_USER: socialUserId })
        console.log(posts)
        res.json(posts)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
}
module.exports = { CreatePost, GetPosts }