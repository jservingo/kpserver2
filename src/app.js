const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const config = require('./config.js');
const cors = require('cors');

const auth = require('./routes/auth.js');
const admin = require('./routes/admin.js');
const courses = require('./routes/courses.js');
//const kp = require('./routes/kp.js');
const error = require('./net/errors.js');
const validateToken = require('./middlewares/validate-token.js')

const app = express();

// Capturar body
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json())

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuracion 
app.set('port', config.app.port);

// Rutas
app.use('/api/user', auth);
app.use('/api/admin', admin);
app.use('/api/courses', courses);
//app.use('/api/courses', validateToken, courses);
//app.use('/api/kp/', kp);

app.use(error);

module.exports = app;
