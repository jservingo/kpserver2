const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    id_page: {
        type: mongoose.Types.ObjectId,
        ref: "Page",
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },   
    items: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    progress: [{ type: mongoose.Types.ObjectId, ref: "Progress" }],
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    date: { type: Date, defautl: Date.now }
})

module.exports = mongoose.model('Card',cardSchema);