const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) return res.status(400).json({error:true, mensaje:'Aceso denegado'}) 

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (error) {
        return res.status(400).json({error:true, mensaje:'Credenciales no válidas'})
    }
}

module.exports = verifyToken;