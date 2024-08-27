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
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    created: { type: Date, defautl: Date.now }, 
    advance: []
})

module.exports = mongoose.model('Card',cardSchema);