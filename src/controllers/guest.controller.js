const mysql = require('mysql2');
const config = require('../config.js');

const sql = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
	port: config.mysql.port
}).promise();

async function get_all_courses(req, res, next) {
    //Obtener todos los cursos 
    const query = `SELECT id, title, status, type, content, status, file, options, tags, author 
        FROM courses ORDER BY created desc`	
	const [courses] = await sql.query(query);
    //console.log(courses)
    res.json({error:false, courses});
}

async function get_course(req, res, next) {
    const query = `SELECT id, title, status, type, content, status, file, options, tags FROM courses WHERE id=?`  
	const [course] = await sql.query(query,[req.params.id]);
    const queryUnits = `SELECT id, title FROM units WHERE id_course=?`
    const [units] = await sql.query(queryUnits,[req.params.id]);
    course[0]["units"] = units
    //console.log(course[0])
    res.json({error:false, course:course[0]})
}

async function get_unit(req, res, next) {
    const query = `SELECT id, title FROM units WHERE id=?`  
	const [unit] = await sql.query(query,[req.params.id]);
    const queryPages = `SELECT id, title FROM pages WHERE id_unit=?`
    const [pages] = await sql.query(queryPages,[req.params.id]);
    unit[0]["pages"] = pages
    //console.log(unit[0])
    res.json({error:false, unit:unit[0]})
}

async function get_page(req, res, next) {
    const query = `SELECT id, title FROM pages WHERE id=?`  
	const [page] = await sql.query(query,[req.params.id]);
    const queryCards = `SELECT id, title FROM cards WHERE id_page=?`
    const [cards] = await sql.query(queryCards,[req.params.id]);
    page[0]["cards"] = cards
    //console.log(page[0])
    res.json({error:false, page:page[0]})
}

async function get_card(req, res, next) {
    const query = `SELECT id, title FROM cards WHERE id=?`  
	const [card] = await sql.query(query,[req.params.id]);
    const queryItems = `SELECT id, type, content, fcontent, options, file, url FROM items WHERE id_card=?`
    const [items] = await sql.query(queryItems,[req.params.id]);
    card[0]["items"] = items
    //console.log(card[0])
    res.json({error:false, card:card[0]})
}

async function get_xunits(req, res, next) {
    const query = `SELECT * FROM units LEFT JOIN courses ON units.id_course=courses.id WHERE courses.id IS null`	
	const [units] = await sql.query(query);
    console.log("X Units",units)
    res.json({error:false, units})
}

async function get_xpages(req, res, next) {
    const query = `SELECT * FROM pages LEFT JOIN units ON pages.id_unit=units.id WHERE units.id IS null`	
	const [pages] = await sql.query(query);
    console.log("X Pages",pages)
    res.json({error:false, pages})
}

async function get_xcards(req, res, next) {
    const query = `SELECT * FROM cards LEFT JOIN pages ON cards.id_page=pages.id WHERE pages.id IS null`	
	const [cards] = await sql.query(query);
    console.log("X Cards",cards)
    res.json({error:false, cards})
}

async function get_xitems(req, res, next) {
    const query = `SELECT * FROM items LEFT JOIN cards ON items.id_card=cards.id WHERE cards.id IS null`	
	const [items] = await sql.query(query);
    console.log("X Items",items)
    res.json({error:false, items})
}

module.exports = {
    get_all_courses,
    get_course,
    get_unit,
    get_page,
    get_card,
    get_xunits,
    get_xpages,
    get_xcards,
    get_xitems
}