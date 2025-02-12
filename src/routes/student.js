const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller.js');

router.get('/', controller.get_subscriptions);
router.get('/home', controller.get_subscriptions);
router.get('/courses', controller.get_courses);
router.get('/course/:id', controller.get_course);
router.get('/unit/:id', controller.get_unit);
router.get('/page/:id', controller.get_page);
router.get('/card/:id', controller.get_card);
router.get('/last/cards', controller.get_last_cards);

router.post('/protected', controller.infoUser);
router.post('/subscription/add', controller.add_subscription);
router.post('/user/update/card', controller.update_last_card);

module.exports = router;