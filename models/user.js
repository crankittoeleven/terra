const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    twitter: {
        type: String,
        required: false
    },
    linkedIn: {
        type: String,
        required: false
    },
    instagram: {
        type: String,
        required: false
    },
    birthDate: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('User', UserSchema);