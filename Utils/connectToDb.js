const mongoose = require('mongoose');

mongoose.connect(process.env.ConnectionString).then(() => {
    console.log('Connected to MongoDB');
})

module.exports = mongoose