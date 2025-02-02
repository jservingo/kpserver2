const express = require('express');
const router = express.Router();
const controller = require('../controllers/guest.controller.js');

router.get('/', controller.get_all_courses);
router.get('/home', controller.get_all_courses);
router.get('/course/:id', controller.get_course);
router.get('/unit/:id', controller.get_unit);
router.get('/page/:id', controller.get_page);
router.get('/card/:id', controller.get_card);
router.get('/xunits', controller.get_xunits);
router.get('/xpages', controller.get_xpages);
router.get('/xcards', controller.get_xcards);
router.get('/xitems', controller.get_xitems);

module.exports = router;