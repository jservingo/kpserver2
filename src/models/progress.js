const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
    id_user: { type: mongoose.Types.ObjectId, ref: 'User' },
    progress: { type: 'Number' }
})

module.exports = mongoose.model('progress',progressSchema);