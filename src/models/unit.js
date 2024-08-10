const mongoose = require('mongoose');

const unitSchema = mongoose.Schema({
    id_course: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    pages: [{ type: mongoose.Types.ObjectId, ref: "Page" }],
    progress: [{ type: mongoose.Types.ObjectId, ref: "Progress" }],
    scores: [{ type: mongoose.Types.ObjectId, ref: "Score" }],
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    date: { type: Date, defautl: Date.now }
})

module.exports = mongoose.model('Unit',unitSchema);