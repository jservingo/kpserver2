const mysql = require('mysql2');
const config = require('../config.js');
const moment = require('moment');

const sql = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
	port: config.mysql.port
}).promise();

async function add_subscription(req, res, next) {
    //Verificar que el usuario no se haya registrado al curso
    /*
    const query = 'SELECT * FROM subscriptions WHERE id_user=? AND id_course=?'	
	//console.log(query);
	const [rows] = await sql.query(query,[req.uid,req.params.id]);
	if (!rows[0]) return res.status(400).json({error:true, mensaje:'Ud. ya está suscrito a este curso'})
    */
    //Insertar en courses_users
    const queryCourses = 'INSERT IGNORE INTO courses_users(id_user,id_course) VALUES (?,?)'
	const [result2] = await sql.query(queryCourses,[req.uid,req.params.id]);
    //Suscribir curso al usuario logeado 
    const queryInsert = 'INSERT IGNORE INTO subscriptions(id_user,id_course) VALUES (?,?)'
	const [result] = await sql.query(queryInsert,[req.uid,req.params.id]);
	//console.log(result)
    res.json({error:false, id:result.insertId})
}

async function get_subscriptions(req, res, next) {
    //Obtener todos los cursos a los cuales el usuario esta suscrito
    const querySubscriptions = `
        SELECT S.last_date, C.id, C.title, C.status, C.type, C.content, C.status, C.file, C.options, C.tags, C.author 
        FROM subscriptions S 
            INNER JOIN courses C ON S.id_course = C.id 
        WHERE S.id_user=? ORDER BY S.last_date desc`	
	//console.log(query);
	const [subscriptions] = await sql.query(querySubscriptions,[req.uid]);
    //console.log("Subscriptios", subscriptions)
    res.json({error:false, subscriptions})
}

async function get_courses(req, res, next) {
    //Obtener todos los cursos a los cuales el usuario no esta suscrito
    const queryCourses = `SELECT C.id, C.title, C.status, C.type, C.content, C.status, C.file, C.options, C.tags, C.author 
        FROM courses C 
            LEFT JOIN (
                SELECT id_course, id_user FROM subscriptions WHERE id_user=?) S
            ON C.id = S.id_course 
        WHERE S.id_course IS NULL ORDER BY C.created desc`	
	//console.log(query);
	const [courses] = await sql.query(queryCourses,[req.uid]);
    //console.log("other courses",courses)
    res.json({error:false, courses})
}

async function get_course(req, res, next) {
    //Verificar que el usuario esta suscrito al curso
    const querySubscription = `
        SELECT id_user FROM subscriptions 
        WHERE id_course=? AND id_user=?`    
    const [rows] = await sql.query(querySubscription,[req.params.id, req.uid]);
    if (!rows[0]) return res.json({error:true, mensaje:'Ud. no está autorizado'})  
    //Obtener curso
    const queryCourse = `SELECT id, title, status, type, content, status, file, options, tags FROM courses WHERE id=?`  
	const [course] = await sql.query(queryCourse,[req.params.id]);
    //Obtener unidades
    const queryUnits = `SELECT id, title FROM units WHERE id_course=?`
    const [units] = await sql.query(queryUnits,[req.params.id]);
    course[0]["units"] = units
    //console.log(course[0])
    res.json({error:false, course:course[0]})
}

async function get_unit(req, res, next) {
    const queryUnit = `SELECT id, id_course, title FROM units WHERE id=?`  
	const [unit] = await sql.query(queryUnit,[req.params.id]);
    //Verificar que el usuario esta suscrito al curso
    const querySubscription = `
        SELECT id_user FROM subscriptions 
        WHERE id_course=? AND id_user=?`
    const [rows] = await sql.query(querySubscription,[unit[0].id_course, req.uid]);
    if (!rows[0]) return res.json({error:true, mensaje:'Ud. no está autorizado'}) 
    //Obtener paginas    
    const queryPages = `SELECT id, title FROM pages WHERE id_unit=?`
    const [pages] = await sql.query(queryPages,[req.params.id]);
    unit[0]["pages"] = pages
    //console.log(unit[0])
    res.json({error:false, unit:unit[0]})
}

async function get_page(req, res, next) {
    const queryPage = `
        SELECT pages.id, pages.id_unit, pages.title, units.id_course
        FROM pages     
            INNER JOIN units 
                ON units.id = pages.id_unit
        WHERE pages.id=?`  
	const [page] = await sql.query(queryPage,[req.params.id]);
    //Verificar que el usuario esta suscrito al curso
    const querySubscription = `
        SELECT id_user FROM subscriptions 
        WHERE id_course=? AND id_user=?`
    const [rows] = await sql.query(querySubscription,[page[0].id_course, req.uid]);
    if (!rows[0]) return res.json({error:true, mensaje:'Ud. no está autorizado'}) 
    //Obtener cards
    const queryCards = `SELECT id, title FROM cards WHERE id_page=?`
    const [cards] = await sql.query(queryCards,[req.params.id]);
    page[0]["cards"] = cards
    //console.log(page[0])
    res.json({error:false, page:page[0]})
}

async function get_card(req, res, next) {
    const queryCard = `
        SELECT cards.id, cards.id_page, cards.title, units.id_course 
        FROM cards 
            INNER JOIN pages 
                ON pages.id = cards.id_page
            INNER JOIN units 
                ON units.id = pages.id_unit
        WHERE cards.id=?`  
	const [card] = await sql.query(queryCard,[req.params.id]);
    //Verificar que el usuario esta suscrito al curso
    const querySubscription = `
        SELECT id_user FROM subscriptions 
        WHERE id_course=? AND id_user=?`
    const [rows] = await sql.query(querySubscription,[card[0].id_course, req.uid]);
    if (!rows[0]) return res.json({error:true, mensaje:'Ud. no está autorizado'}) 
    //Obtener items
    const queryItems = `SELECT id, type, content, fcontent, options, file, url FROM items WHERE id_card=?`
    const [items] = await sql.query(queryItems,[req.params.id]);
    card[0]["items"] = items
    //console.log(card[0])
    res.json({error:false, card:card[0]})
}

async function get_last_cards(req, res, next) {
    const query = `
        SELECT cards.id as id_card, cards.title as card_title,
               pages.id as id_page, pages.title as page_title,
               units.id as id_unit, units.title as unit_title,
               courses.id as id_course, courses.title as course_title
            FROM courses_users 
            INNER JOIN cards
                ON cards.id = courses_users.last_card
            INNER JOIN pages
                ON pages.id = cards.id_page
            INNER JOIN units
                ON units.id = pages.id_unit
            INNER JOIN courses
                ON courses.id = units.id_course
            WHERE courses_users.id_user = ?            
            ORDER BY courses_users.last_date DESC`
    const [cards] = await sql.query(query,[req.uid]);
    //console.log(cards)
    res.json({error:false, cards})
}

async function update_last_card(req, res, next) {
    const querySelect = `
        SELECT courses.id FROM cards
            INNER JOIN pages
                ON pages.id = cards.id_page
            INNER JOIN units
                ON units.id = pages.id_unit
            INNER JOIN courses
                ON courses.id = units.id_course
            WHERE cards.id = ?`
    const [course] = await sql.query(querySelect,[req.params.id]);
    let id_course = course[0].id
    const queryInsert = `INSERT IGNORE INTO courses_users(id_course, id_user, last_card, last_date) VALUES (?,?,?,?)`
    const [result1] = await sql.query(queryInsert,[id_course, req.uid, req.params.id, moment().format('YYYY-MM-DD hh:mm:ss')]);
    const queryUpdate = `UPDATE courses_users SET last_card=?, last_date=? WHERE id_course=? AND id_user=?`
    const [result2] = await sql.query(queryUpdate,[req.params.id, moment().format('YYYY-MM-DD hh:mm:ss'), id_course, req.uid]);
    const querySubscriptions = `UPDATE subscriptions SET last_card=?, last_date=? WHERE id_course=? AND id_user=?`
    const [result3] = await sql.query(querySubscriptions,[req.params.id, moment().format('YYYY-MM-DD hh:mm:ss'), id_course, req.uid]);
    //console.log("update_last_card",id_course)
    res.json({error:false})
}

async function infoUser(req, res) {
    try {
        const user = await User.findById(req.uid).lean();
        return res.json({ email: user.email, id: user._id });
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
};

module.exports = {
    get_subscriptions,
    get_courses,
    get_course,
    get_unit,
    get_page,
    get_card,
    get_last_cards,
    update_last_card,
    add_subscription,
    infoUser
}