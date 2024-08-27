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
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    created: { type: Date, defautl: Date.now }, 
    advance: []
})

module.exports = mongoose.model('Page',pageSchema);