const mongoose = require('mongoose');

const scoreSchema = mongoose.Schema({
    id_user: { type: mongoose.Types.ObjectId, ref: 'User' },
    score: { type: 'Number' }
})

module.exports = mongoose.model('score',scoreSchema);