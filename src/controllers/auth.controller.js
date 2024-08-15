const User = require('../models/user');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
})

async function login(req, res, next) {
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({error:true, mensaje:error.details[0].message})

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).json({error:true, mensaje:'Usuario no registrado'}) 

    const passwordValid = await bcrypt.compare(req.body.password, user.password)
    if (!passwordValid) return res.status(400).json({error:true, mensaje:'La contraseña no es válida'})     

    const token = jwt.sign({
        name: user.name,
        id: user._id
    },process.env.TOKEN_SECRET)

    res.header('auth-token',token).json({
        error: false,
        data: {token},
        user: {name: user.name, id: user._id}
    })
}

async function register(req, res, next) {
    const { error } = schemaRegister.validate(req.body);
    if (error) return res.status(400).json({error:true,mensaje:error.details[0].message})

    const existsEmail = await User.findOne({email: req.body.email})
    if (existsEmail) return res.status(400).json({error:true, mensaje:'Este email ya está registrado'})

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password
    })

    try {
        const userDB = await user.save();
        res.json({error:false, user:userDB})

    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = {
    login, 
    register
}