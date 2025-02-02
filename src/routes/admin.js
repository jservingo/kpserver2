const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload')
const controller = require('../controllers/admin.controller.js');

router.get('/', controller.get_all_courses);
router.get('/home', controller.get_all_courses);
router.get('/course/:id', controller.get_course);
router.get('/unit/:id', controller.get_unit);
router.get('/page/:id', controller.get_page);
router.get('/card/:id', controller.get_card);

router.post('/course/create', controller.create_course);
router.post('/unit/create', controller.create_unit);
router.post('/page/create', controller.create_page);
router.post('/card/create', controller.create_card);
router.post('/item/create/content', controller.create_item_content);
router.post('/item/create/image', fileUpload({createParentPath: true}), controller.create_item_file);
router.post('/item/create/audio', fileUpload({createParentPath: true}), controller.create_item_file);
router.post('/item/create/video', fileUpload({createParentPath: true}), controller.create_item_file);

router.post('/course/update', controller.update_course);
router.post('/unit/update', controller.update_unit);
router.post('/page/update', controller.update_page);
router.post('/card/update', controller.update_card);
router.post('/item/update', controller.update_item);

router.post('/course/delete', controller.delete_course);
router.post('/unit/delete', controller.delete_unit);
router.post('/page/delete', controller.delete_page);
router.post('/card/delete', controller.delete_card);
router.post('/item/delete', controller.delete_item);

router.get('/clipboard/units', controller.get_units_from_clipboard);
router.get('/clipboard/pages', controller.get_pages_from_clipboard);
router.get('/clipboard/cards', controller.get_cards_from_clipboard);
router.get('/clipboard/items', controller.get_items_from_clipboard);

router.post('/clipboard/unit/add', controller.add_unit_to_clipboard);
router.post('/clipboard/page/add', controller.add_page_to_clipboard);
router.post('/clipboard/card/add', controller.add_card_to_clipboard);
router.post('/clipboard/item/add', controller.add_item_to_clipboard);

router.post('/unit/update/course', controller.update_unit_course);
router.post('/page/update/unit', controller.update_page_unit);
router.post('/card/update/page', controller.update_card_page);
router.post('/item/update/card', controller.update_item_card);

router.post('/unit/update/down', controller.update_unit_down);
router.post('/unit/update/up', controller.update_unit_up);
router.post('/page/update/down', controller.update_page_down);
router.post('/page/update/up', controller.update_page_up);
router.post('/card/update/down', controller.update_card_down);
router.post('/card/update/up', controller.update_card_up);
router.post('/item/update/down', controller.update_item_down);
router.post('/item/update/up', controller.update_item_up);
/*
router.post('/course/progress/add', add_course_progress);
router.post('/course/score/add', add_course_score);
router.post('/unit/progress/add', add_unit_progress);
router.post('/unit/score/add', add_unit_score);
router.post('/page/progress/add', add_page_progress);
router.post('/page/score/add', add_page_score);
router.post('/card/progress/add', add_card_progress);
*/

module.exports = router;