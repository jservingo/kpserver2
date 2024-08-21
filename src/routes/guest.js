const express = require('express');
const router = express.Router();
const controller = require('../controllers/guest.controller.js');

router.get('/', controller.get_all_courses);
router.get('/course/:id', controller.get_course);
router.get('/page/:id', controller.get_page);

module.exports = router;