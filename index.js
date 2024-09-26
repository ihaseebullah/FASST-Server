const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv').config();
const AuthRouter = require('./Routes/AuthRoutes');
const isLoggedin = require('./Middlewares/isLoggedin');
const { ChallengesRouter } = require('./Routes/ChallengesRouter');
const challengesPicker = require('./Middlewares/challengesPicker');
const authenticateJWT = require('./Middlewares/authenticateJWT');
const DataGatheringRouter = require('./Routes/DataGatheringRouter');
const InsightsRouter = require('./Routes/InsightsRouter');
const SocialRouter = require('./Routes/SocialRouter');
const WorkoutRouter = require('./Routes/WorkoutsRouter');
const MarketPlaceRouter = require('./Routes/MarketPlaceRouter');
const cloudinary = require('cloudinary').v2
const multer = require('multer');
require('./Utils/connectToDb');
require('./Auth/Passport')
const app = express();
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLD_Name,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Authentication Router
app.use('/auth', AuthRouter);

// Authenticate via JWT if available
app.use(authenticateJWT)

// Challenges Middlware
app.use(challengesPicker);

// App Routes
app.get('/root', isLoggedin, (req, res) => {
    console.log(req.user)
    res.json(req.user)
});
app.use('/api', ChallengesRouter)
app.use('/api', DataGatheringRouter)
app.use('/api', InsightsRouter)
app.use('/api', SocialRouter)
app.use('/api', WorkoutRouter)
app.use('/api', MarketPlaceRouter)


app.post('/api/fasst/services/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        console.log('Uploaded file:', req.file);
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).send(error);
                }
                console.log('Upload successful:', result);
                return res.json({ url: result.secure_url });
            }
        );
        stream.end(req.file.buffer);
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


//Start server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
