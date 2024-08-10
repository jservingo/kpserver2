const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/kopedia')
    .then (db => console.log('DB is connected'))
    .catch (error => console.log(error))

module.exports = mongoose;

