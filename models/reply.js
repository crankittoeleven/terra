const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    authorId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    authorFirstName: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Reply', ReplySchema);