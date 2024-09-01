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
require('./Utils/connectToDb');
require('./Auth/Passport')
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

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
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
