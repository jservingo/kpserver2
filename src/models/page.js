const mongoose = require('mongoose');

const pageSchema = mongoose.Schema({
    id_unit: {
        type: mongoose.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    cards: [{ type: mongoose.Types.ObjectId, ref: "Card" }],
    progress: [{ type: mongoose.Types.ObjectId, ref: "Progress" }],
    scores: [{ type: mongoose.Types.ObjectId, ref: "Score" }],
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    date: { type: Date, defautl: Date.now }
})

module.exports = mongoose.model('Page',pageSchema);