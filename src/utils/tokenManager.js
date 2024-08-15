const jwt = require('jsonwebtoken')

const generateToken = (uid) => {
    const expiresIn = 60 * 15;

    try {
        //El payload es { uid }
        //const token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn });
        const token = jwt.sign({ uid }, process.env.JWT_SECRET);
        return { token, expiresIn };
    } catch (error) {
        console.log(error);
    }
};

const tokenVerificationErrors = {
    "invalid signature": "La firma del JWT no es válida",
    "jwt expired": "JWT expirado",
    "invalid token": "Token no válido",
    "No Bearer": "Utiliza formato Bearer",
    "jwt malformed": "JWT formato no válido",
};

module.exports = tokenVerificationErrors;