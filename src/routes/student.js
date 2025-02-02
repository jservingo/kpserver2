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
router.get('/user/update/card/:id', controller.update_last_card);
router.post('/protected', controller.infoUser);
router.get('/subscription/add/:id', controller.add_subscription);

module.exports = router;