const express = require('express');
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

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuracion 
app.set('port', config.app.port);

/*
function handle404(req, res, next) {
    res.status(404);
  
    if (req.accepts('html')) {
      res.render('error', { message: 'Oops! Page not found.' });
    } else {
      res.json({ message: 'Oops! Page not found.' });
    }
}
*/
  
// Rutas
app.use('/api/user', auth);
app.use('/api/guest', guest);
app.use('/api/student', validateToken, student); 
app.use('/api/admin', validateToken, admin);
app.use('/uploads',express.static('uploads'));
//app.use(handle404);

module.exports = app;
