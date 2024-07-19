

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    localGovernment: String,  // Add this line
    email: String,
    phone: String,
    image: String,
});

module.exports = mongoose.model('Property', propertySchema);


