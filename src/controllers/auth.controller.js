const mysql = require('mysql2');
const config = require('../config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sql = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
	port: config.mysql.port
}).promise();

async function login(req, res, next) {
	const query = 'SELECT * FROM users WHERE email=?'
	const [rows] = await sql.query(query,[req.body.email]);
	const user = rows[0]
	//console.log(req.body.email);
	//console.log(user)
	if (!user) return res.status(400).json({error:true, mensaje:'Usuario no registrado'})
	
	const passwordValid = await bcrypt.compare(req.body.password, user.password)
	if (!passwordValid) return res.status(400).json({error:true, mensaje:'La contraseña no es válida'})     

	const token = jwt.sign({
		name: user.name,
		id: user.id
	},process.env.TOKEN_SECRET)

	res.header('auth-token',token).json({
		error: false,
		data: {token},
		user: {name: user.name, id: user.id}
	})
}

async function register(req, res, next) {
	const query = 'SELECT * FROM users WHERE email=?'	
	//console.log(query);
	const [rows] = await sql.query(query,[req.body.email]);
	const user = rows[0]
	if (user) return res.status(400).json({error:true, mensaje:'Este email ya está registrado'})

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
	//console.log(password);

	const queryInsert = 'INSERT INTO users(name,email,password) VALUES (?,?,?)'
	const [result] = await sql.query(queryInsert,[req.body.name,req.body.email,password]);
	//console.log(result)

	res.json({error: false, user:{
		"name": req.body.name,
		"email": req.body.email,
		"_id": result.insertId}
	});
}

module.exports = {
    login, 
    register
}