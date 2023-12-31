const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Like', LikeSchema);