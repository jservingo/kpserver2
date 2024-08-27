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
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    created: { type: Date, defautl: Date.now }, 
    advance: []
})

module.exports = mongoose.model('Unit',unitSchema);