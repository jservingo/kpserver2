const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller.js');

router.get('/', controller.get_all_courses);
//router.get('/home', controller.get_all_courses);
router.get('/course/:id', controller.get_course);
//router.get('/unit/:id', controller.get_unit);
router.get('/page/:id', controller.get_page);
//router.get('/card', controller.get_card);
router.post('/protected', controller.infoUser);
router.post('/subscription/add/:id', controller.add_subscription);

module.exports = router;