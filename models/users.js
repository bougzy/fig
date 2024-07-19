const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String, // In a real app, use encryption
    email: String,
    phone: String,
});

module.exports = mongoose.model('User', userSchema);
