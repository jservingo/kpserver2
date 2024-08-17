const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const config = require('./config.js');
const cors = require('cors');

const auth = require('./routes/auth.js');
const admin = require('./routes/admin.js');
const courses = require('./routes/courses.js');
const kcourses = require('./routes/kcourses.js');
const validateToken = require('./middlewares/validateToken.js')
//const validateToken = require('./middlewares/validate-token.js')

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
app.use('/api/admin', validateToken, admin);
app.use('/api/courses', courses);
app.use('/api/kcourses', validateToken, kcourses);
//app.use('/api/courses', courses);

module.exports = app;
