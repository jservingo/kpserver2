const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    date: { type: Date, defautl: Date.now },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
})

module.exports = mongoose.model('Subscription',subscriptionSchema);