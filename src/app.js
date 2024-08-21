const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const config = require('./config.js');
const cors = require('cors');

const auth = require('./routes/auth.js');
const guest = require('./routes/guest.js');
const student = require('./routes/student.js');
const admin = require('./routes/admin.js');
const validateToken = require('./middlewares/validateToken.js')

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
app.use('/api/guest', guest);
app.use('/api/student', validateToken, student);
app.use('/api/admin', validateToken, admin);

module.exports = app;
