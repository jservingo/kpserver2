const { Mongoose, default: mongoose } = require('mongoose');
const User = require('../models/user');
const Course = require('../models/course');
const Unit = require('../models/unit');
const Page = require('../models/page');
const Card = require('../models/card');
const Item = require('../models/item');

async function get_all_courses(req, res, next) {
    //Obtener todos los cursos 
    const courses = await Course.find({});
    res.json({error:false, courses});
}

async function get_course(req, res, next) {
    console.log(req.params.id)
    const course = await Course.aggregate([
        {   $match: {"_id": new mongoose.Types.ObjectId(req.params.id)}},
        {
            $lookup: {
                "from": "units",
                "localField": "units",
                "foreignField": "_id",
                "as": "units"
            }
        },
        {   $unwind: "$units"},
        {
            $lookup: {
                "from": "pages",
                "localField": "units.pages",
                "foreignField": "_id",
                "as": "pages"
            }
        },
        {
            $addFields: { // Move the pages back to pages document
                "units.pages": "$pages"
            }
        }, 
        {
            $project: { 
                "pages": 0, // Remove the pages embedded array.
                "cards": 0
            }
        },
        {
            $group: {
                _id: null,
                title : { $first: '$title' },
                units: {
                    $push: "$units"
                }
            }
        }
    ])
    res.json({error:false, course})
}

async function get_page(req, res, next) {
    const page = await Page.aggregate([
        // Falta mostrar progress y scores del usuario en course, units y pages
        {   $match: {"_id": new mongoose.Types.ObjectId(req.params.id)}},
        {
            $lookup: {
                "from": "cards",
                "localField": "cards",
                "foreignField": "_id",
                "as": "cards"
            }
        },
        {   $unwind: "$cards"},
        {
            $lookup: {
                "from": "items",
                "localField": "cards.items",
                "foreignField": "_id",
                "as": "items"
            }
        },
        {
            $addFields: { // Move the items back to pages document
                "cards.items": "$items"
            }
        }, 
        {
            $project: { 
                "items": 0 // Remove the pages embedded array.
            }
        },
        {
            $group: {
                _id: null,
                title : { $first: '$title' },
                cards: {
                    $push: "$cards"
                }
            }
        }
    ])
    res.json({error:false, page})           
}

module.exports = {
    get_all_courses,
    get_course,
    get_page
}