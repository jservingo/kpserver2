const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    id_card: {
        type: mongoose.Types.ObjectId,
        ref: "Card",
        required: true
    },
    type: { type: String },
    text: { type: String },
    url: { type: String },
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    created: { type: Date, defautl: Date.now }
})

module.exports = mongoose.model('Item',itemSchema);