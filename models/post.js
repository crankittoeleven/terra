const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    authorId: {
        type: String,
        required: true,
    },
    topicId: {
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

module.exports = mongoose.model('Post', PostSchema);