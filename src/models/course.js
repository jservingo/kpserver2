const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    units: [{ type: mongoose.Types.ObjectId, ref: "Unit" }],
    progress: [{ type: mongoose.Types.ObjectId, ref: "Progress" }],
    scores: [{ type: mongoose.Types.ObjectId, ref: "Score" }],
    subscribers: [{ type: mongoose.Types.ObjectId, ref: "User" }], 
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    date: { type: Date, defautl: Date.now }
})

module.exports = mongoose.model('Course',courseSchema);
