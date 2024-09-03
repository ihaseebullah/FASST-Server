const ChangePassword = require('../Auth/ChangePassword')
const emailVerification = require('../Auth/EmailVerification')
const { SendOTP, verifyOTP, resetPassword } = require('../Auth/ForgotPassword')
const { Login } = require('../Auth/Login')
const { Register, UnverifiedRegistration } = require('../Auth/Register')
const isLoggedin = require('../Middlewares/isLoggedin')

const AuthRouter = require('express').Router()

AuthRouter.post('/uregister', UnverifiedRegistration)
AuthRouter.post('/register', Register)
AuthRouter.post('/login', Login)
AuthRouter.put('/email-verification', emailVerification)
AuthRouter.post('/change-password', isLoggedin, ChangePassword)
//Forgot Password
AuthRouter.post('/forgot-password/send-OTP', SendOTP)
AuthRouter.put('/forgot-password/verify-OTP', verifyOTP)
AuthRouter.put('/forgot-password/reset-password', resetPassword)

//logout
AuthRouter.post('/logout', (req, res) => {
    req.user = null;
    req.socialUser = null
    res.clearCookie('jwt');
    req.logout(function (err) {
        if (err) { return next(err); }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});



module.exports = AuthRouter