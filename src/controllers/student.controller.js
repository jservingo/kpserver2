const { Mongoose, default: mongoose } = require('mongoose');
const User = require('../models/user');
const Course = require('../models/course');
const Subscription = require('../models/subscription');
const Unit = require('../models/unit');
const Page = require('../models/page');
const Card = require('../models/card');
const Item = require('../models/item');

async function add_subscription(req, res, next) {
    /*
    const user = await User.findById(new mongoose.Types.ObjectId(req.uid))
        .populate({ 
            path: 'subscriptions', 
            match: {
                course: new mongoose.Types.ObjectId(req.params.id)
            }
        });
    */
    //Suscribir curso al usuario logeado 
    const subscription = new Subscription({
        date: "2024-05-09T21:53:43.00000Z",
		course: new mongoose.Types.ObjectId(req.params.id)
    })
    try {
        const subscriptionDB = await subscription.save();
        const user = await User.findById(req.uid)
        user.subscriptions.push(subscriptionDB.id); 
        user.save()
        res.json({error:false, id:subscriptionDB.id})
    } catch (error) {
        res.status(400).json(error)
    }
}

async function get_all_courses(req, res, next) {
    //Obtener todos los cursos a los cuales el usuario esta suscrito
    /*
    const courses = await User.aggregate([
        // Falta mostrar progress y scores del usuario en course, units y pages
        {   $match: {"_id": new mongoose.Types.ObjectId(req.uid)}},
        {
            $lookup: {
                "from": "subscriptions",
                "localField": "subscriptions",
                "foreignField": "_id",
                "as": "subscriptions"
            }
        },
        {   $unwind: "$subscriptions"},
        {
            $lookup: {
                "from": "courses",
                "localField": "subscriptions.course",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {
            $addFields: { // Move the items back to pages document
                "subscriptions.course": "$course"
            }
        }, 
        {
            $project: { 
                "course": 0 // Remove the pages embedded array.
            }
        },
        {
            $group: {
                _id: null,
                //title : { $first: '$title' },
                subscriptions: {
                    $push: "$subscriptions"
                }
            }
        }
    ]);
    console.log(courses);
    res.json({error:false, courses})
    */
    const user = await User.findById(new mongoose.Types.ObjectId(req.uid))
        .populate({ 
            path: 'subscriptions', 
            options: { sort: { date: -1 }}, 
            populate: {
                path : 'course'                  
            }
        });
    //console.log(courses);
    console.log(user.subscriptions)
    res.json({error:false, subscriptions:user.subscriptions})
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
    ]);
    console.log(courses);
    res.json({error:false, courses});
    /*
    const user = await User.findById(req.uid)
        .populate('courses.course');    
    const courses = user.courses; 
    console.log(courses);
    res.json({error:false, courses});
    */
    /*
    const courses = await Course.find({
        subscribers: { $in: [new mongoose.Types.ObjectId(req.uid)]} 
    })
     res.json({error:false, courses})
    */
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
    add_subscription,
    infoUser
}