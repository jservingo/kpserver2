const { Mongoose, default: mongoose } = require('mongoose');
const User = require('../models/user');
const Course = require('../models/course');
const Unit = require('../models/unit');
const Page = require('../models/page');
const Card = require('../models/card');
const Item = require('../models/item');

async function add_course_subscriber(req, res, next) {
    const course = await Course.findById(req.body.id_course)
    course.subscribers.push(new mongoose.Types.ObjectId("66b01773002dd2f287caff97"))
    course.save()
    res.json({error:false})
}

async function get_all_courses(req, res, next) {
    //FALTA: Obtener cursos donde el usuario esta suscrito
    const courses = await Course.find({
        author: new mongoose.Types.ObjectId("66b12d84a442c9b26a6ad69b")
    })
    res.json({error:false, courses})
}

async function get_course(req, res, next) {
    //console.log(req.params.id)
    const course = await Course.aggregate([
        // Falta mostrar progress y scores del usuario en course, units y pages
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

async function infoUser(req, res) {
    //return res.json({user: "hola soy yo"})
    try {
        const user = await User.findById(req.uid).lean();
        return res.json({ email: user.email, id: user._id });
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
};

module.exports = {
    get_all_courses,
    get_course,
    get_page,
    add_course_subscriber,
    infoUser
}