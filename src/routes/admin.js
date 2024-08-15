const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller.js');

router.post('/course/create', controller.create_course);
router.post('/unit/create', controller.create_unit);
router.post('/page/create', controller.create_page);
router.post('/card/create', controller.create_card);
router.post('/item/create', controller.create_item);

router.post('/course/subscriber/add', controller.add_course_subscriber);
/*
router.post('/course/progress/add', add_course_progress);
router.post('/course/score/add', add_course_score);
router.post('/unit/progress/add', add_unit_progress);
router.post('/unit/score/add', add_unit_score);
router.post('/page/progress/add', add_page_progress);
router.post('/page/score/add', add_page_score);
router.post('/card/progress/add', add_card_progress);
*/

router.get('/', controller.get_all_courses);
router.get('/home', controller.get_all_courses);
router.get('/course/:id', controller.get_course);
//router.get('/unit/:id', controller.get_unit);
router.get('/page/:id', controller.get_page);
//router.get('/card', controller.get_card);

module.exports = router;