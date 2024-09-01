const { default: mongoose } = require("mongoose");

const UregisterSchema = new mongoose.Schema({
    email: String,
    password: String,
    OTP: { type: String, default:Math.floor(100000 + Math.random() * 900000).toString(), expires: '30m' },
})

const URegister = mongoose.model("URegister", UregisterSchema)

module.exports = URegister