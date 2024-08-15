const jwt = require("jsonwebtoken");
const tokenVerificationErrors = require("../utils/tokenManager.js");

const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization;

        if (!token) throw new Error("No Bearer");

        token = token.split(" ")[1];
        //El verify devuelve el payload
        const { id } = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(id);

        //Esto añade al request la propiedad uid
        req.uid = id;

        next();
    } catch (error) {
        console.log(error.message);
        return res
            .status(401)
            .send({ error: tokenVerificationErrors[error.message] });
    }
};

module.exports = requireToken;