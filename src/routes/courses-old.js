const express = require('express');
const router = express.Router();
//const controller = require('../controllers/courses.js');

const fs = require('fs');
path = require('path');

router.get('/', get_all_courses);
router.get('/courses', get_all_courses);
router.get('/course/:id', get_course);
router.get('/page/:id', get_page);

async function get_all_courses(req, res, next) {
	/*
	try {
		const items = await controller.get_all_courses(); 
		response.success(req, res, items);
	}catch(err){
		next(err);
	} 
	*/
	let userFilePath = path.join(__dirname, '../../courses/courses.json');
	//console.log(userFilePath);
	fs.readFile(userFilePath, (err, json) => {
        let obj = JSON.parse(json);
		res.json(obj);
    });
}

async function get_course(req, res, next) {
	/*
	try {
		const items = await controller.get_course(req.params.id); 
		response.success(req, res, items);
	}catch(err){
		next(err);
	} 
	*/
	let userFilePath = path.join(__dirname, '../../courses/000001.json');
	//console.log(userFilePath);
	fs.readFile(userFilePath, (err, json) => {
        let obj = JSON.parse(json);
		res.json(obj);
    });
}

async function get_page(req, res, next) {
	let userFilePath = path.join(__dirname, '../../courses/000001-01-01.json');
	//console.log(userFilePath);
	fs.readFile(userFilePath, (err, json) => {
        let obj = JSON.parse(json);
		res.json(obj);
    }); 
}

module.exports = router;
