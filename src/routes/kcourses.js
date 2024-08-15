const express = require('express');
const router = express.Router();
const { Mongoose, default: mongoose } = require('mongoose');
const User = require('../models/user');
const validateToken = require('../middlewares/validateToken.js')

router.post('/protected', infoUser);

async function infoUser(req, res) {
    //return res.json({user: "hola soy yo"})
    try {
        const user = await User.findById(req.uid).lean();
        return res.json({ email: user.email, id: user._id });
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
};

module.exports = router;