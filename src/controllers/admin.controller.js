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

// **********************************************************
// READ
// **********************************************************

async function get_all_courses(req, res, next) {
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

    /*
    Course.findOne({ _id: new mongoose.Types.ObjectId("66b3a133d2dcd543e3d44397") })
        .populate({ 
            path: 'units',
            populate: {
                path: 'pages',
                model: 'Page'
            } 
        }) 
        .then((course) => {
            res.json({error:false, course}) 
        }).catch((err) => {
            console.log(err)
        })
    */
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
    /*
    Page.findOne({ _id: new mongoose.Types.ObjectId("66b3c74051d835d1c6424aaa") })
        .populate({ 
            path: 'cards',
            populate: {
                path: 'items',
                model: 'Item'
            }
        })        
        .then((page) => {
            res.json({error:false, page}) 
        }).catch((err) => {
            console.log(err)
        })
    */        
}

// NO SE USA
async function get_unit(req, res, next) {
    Unit.findOne({ _id: new mongoose.Types.ObjectId("66b3c540f001e2573ab4672e") })
        .populate('pages')
        .then((unit) => {
            res.json({error:false, unit}) 
        }).catch((err) => {
            console.log(err)
        })        
}

// NO SE USA
async function get_card(req, res, next) {
    Card.findOne({ _id: new mongoose.Types.ObjectId("66b3a133d2dcd543e3d44397") })
        .populate('units')
        .then((course) => {
            res.json({error:false, course}) 
        }).catch((err) => {
            console.log(err)
        })        
}

// **********************************************************
// CREATE
// **********************************************************

async function create_course(req, res, next) {
	const course = new Course({
        title: req.body.title,
		author: new mongoose.Types.ObjectId('66b12d84a442c9b26a6ad69b')
    })
    try {
        const courseDB = await course.save();
        res.json({error:false, id:courseDB.id})

    } catch (error) {
        res.status(400).json(error)
    }
}

async function create_unit(req, res, next) { 
    const unit = new Unit({
        title: req.body.title,
        id_course: req.body.id_course,
		author: new mongoose.Types.ObjectId('66b12d84a442c9b26a6ad69b')
    })
    try {
        const unitDB = await unit.save();
        const course = await Course.findById(req.body.id_course)
        course.units.push(unitDB.id); 
        course.save()
        res.json({error:false, id:unitDB.id})
    } catch (error) {
        res.status(400).json(error)
    }
}

async function create_page(req, res, next) { 
    const page = new Page({
        title: req.body.title,
        id_unit: req.body.id_unit,
		author: new mongoose.Types.ObjectId('66b12d84a442c9b26a6ad69b')
    })
    try {
        const pageDB = await page.save();
        const unit = await Unit.findById(req.body.id_unit)
        unit.pages.push(pageDB.id); 
        unit.save()
        res.json({error:false, id:pageDB.id})
    } catch (error) {
        res.status(400).json(error)
    }
}

async function create_card(req, res, next) { 
    const card = new Card({
        title: req.body.title,
        id_page: req.body.id_page,
		author: new mongoose.Types.ObjectId('66b12d84a442c9b26a6ad69b')
    })
    try {
        const cardDB = await card.save();
        const page = await Page.findById(req.body.id_page)
        page.cards.push(cardDB.id); 
        page.save()
        res.json({error:false, id:card.id})
    } catch (error) {
        res.status(400).json(error)
    }
}

async function create_item(req, res, next) { 
    const item = new Item({
        type: req.body.type,
        text: req.body.text,
        url: req.body.ur,
        id_card: req.body.id_card,
		author: new mongoose.Types.ObjectId('66b12d84a442c9b26a6ad69b')
    })
    try {
        const itemDB = await item.save();
        const card = await Card.findById(req.body.id_card)
        card.items.push(itemDB.id); 
        card.save()
        res.json({error:false, id:item.id})
    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = {
    add_course_subscriber,
    get_all_courses, 
    get_course, 
    get_page,
    create_course,
    create_unit,
    create_page,
    create_card,
    create_item
}

