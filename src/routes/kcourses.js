const express = require('express');
const router = express.Router();
const controller = require('../controllers/kcourses.controller.js');

router.post('/protected', controller.infoUser);

module.exports = router;