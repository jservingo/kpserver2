const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    units: [{ type: mongoose.Types.ObjectId, ref: "Unit" }],
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    created: { type: Date, defautl: Date.now },
    subscribers: [{ type: mongoose.Types.ObjectId, ref: "User" }], 
    advance: []
})

module.exports = mongoose.model('Course',courseSchema);
