const mysql = require('mysql2');
const config = require('../config.js');
const fs = require('fs');
const path = require("path")
var mjAPI = require("mathjax-node");

const sql = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
	port: config.mysql.port
}).promise();

// **********************************************************
// READ
// **********************************************************

async function get_all_courses(req, res, next) {
    //Obtener cursos donde el autor sea el usuario logeado
    const query = `SELECT C.id, C.title, C.status, C.type, C.content, C.status, C.file, C.options, C.tags, C.author 
        FROM courses C
        INNER JOIN courses_users U ON U.id_course = C.id AND U.id_user = C.author
        WHERE C.author=? ORDER BY U.last_date desc`	
	console.log("All courses - User",req.uid);
	const [courses] = await sql.query(query,[req.uid]);
    console.log(courses)
    res.json({error:false, courses})
}

async function get_course(req, res, next) {
    const query = `SELECT id, title, status, type, content, status, file, options, tags FROM courses WHERE id=?`  
	const [course] = await sql.query(query,[req.params.id]);
    const queryUnits = `SELECT id, title FROM units WHERE id_course=? ORDER BY id`
    const [units] = await sql.query(queryUnits,[req.params.id]);
    course[0]["units"] = units
    //console.log("Course",course[0]);
    res.json({error:false, course:course[0]})
}

async function get_unit(req, res, next) {
    const query = `SELECT id, title FROM units WHERE id=?`  
	const [unit] = await sql.query(query,[req.params.id]);
    const queryPages = `SELECT id, title FROM pages WHERE id_unit=? ORDER BY id`
    const [pages] = await sql.query(queryPages,[req.params.id]);
    unit[0]["pages"] = pages
    //console.log(unit[0])
    res.json({error:false, unit:unit[0]})
}

async function get_page(req, res, next) {
    const query = `SELECT id, title FROM pages WHERE id=?`  
	const [page] = await sql.query(query,[req.params.id]);
    const queryCards = `SELECT id, title FROM cards WHERE id_page=? ORDER BY id`
    const [cards] = await sql.query(queryCards,[req.params.id]);
    page[0]["cards"] = cards
    //console.log(page[0])
    res.json({error:false, page:page[0]})
}

async function get_card(req, res, next) {
    const query = `SELECT id, title FROM cards WHERE id=?`  
	const [card] = await sql.query(query,[req.params.id]);
    const queryItems = `SELECT id, type, content, fcontent, options, file, url FROM items WHERE id_card=? ORDER BY id`
    const [items] = await sql.query(queryItems,[req.params.id]);
    card[0]["items"] = items
    //console.log(card[0])
    res.json({error:false, card:card[0]})
}

// **********************************************************
// CREATE
// **********************************************************

async function create_course(req, res, next) {
    //console.log(req.body)
    //console.log("title",req.body.title)
    const title = req.body.title.substr(0,255)
    const query = `INSERT INTO courses(title,status,author) VALUES(?,?,?)`
    const [result] = await sql.query(query,[title,0,req.uid]);
    const query2 = `INSERT INTO subscriptions(id_user,id_course) VALUES(?,?)`
    const [result2] = await sql.query(query2,[req.uid,result.insertId]);
	//console.log(result)
	res.json({error: false, course:{"id":result.insertId}});
}

async function create_unit(req, res, next) { 
    const title = req.body.title.substr(0,255)
    const query = `INSERT INTO units(id_course,title,author) VALUES(?,?,?)`
    const [result] = await sql.query(query,[req.body.id_course,title,req.uid]);
	//console.log(result)
	res.json({
        error: false, 
        unit:{
            "id": result.insertId,
            "id_course": req.body.id_course,
            "title": req.body.title,
            "author": req.uid,
            "created": "2024-09-26 19:15:46" 
        }
    });
}

async function create_page(req, res, next) { 
    const title = req.body.title.substr(0,255)
    const query = `INSERT INTO pages(id_unit,title,author) VALUES(?,?,?)`
    const [result] = await sql.query(query,[req.body.id_unit,title,req.uid]);
	//console.log(result)
	res.json({
        error: false, 
        page:{
            "id": result.insertId,
            "id_unit": req.body.id_unit,
            "title": req.body.title,
            "author": req.uid,
            "created": "2024-09-26 19:15:46" 
        }
    });
}

async function create_card(req, res, next) { 
    const title = req.body.title.substr(0,255)
    const query = `INSERT INTO cards(id_page,title,author) VALUES(?,?,?)`
    const [result] = await sql.query(query,[req.body.id_page,title,req.uid]);
	//console.log(result)
	res.json({
        error: false, 
        card:{
            "id": result.insertId,
            "id_page": req.body.id_page,
            "title": req.body.title,
            "author": req.uid,
            "created": "2024-09-26 19:15:46"     
        }
    });
}

async function create_item_content(req, res, next) { 
    //console.log("CREATE ITEM CONTENT")
    //console.log(req)
    const url = req.body.url.substr(0,255)  
    let fcontent = ""
    if (req.body.type=="text") { 
        fcontent = await slatex(req.body.content)
    }
    if (req.body.type=="formula") {
        fcontent = await get_mathml(req.body.content)        
    }
    const query = `INSERT INTO items(id_card,type,content,fcontent,options,url,author) VALUES(?,?,?,?,?,?,?)`
    const [result] = await sql.query(query,[req.body.id_card,req.body.type,req.body.content,fcontent,req.body.options,url,req.uid]);
    res.json({
        error: false, 
        item:{
            "id": result.insertId,
            "id_card": req.body.id_card,
            "type": req.body.type,
            "content": req.body.content,
            "fcontent" : fcontent,
            "options": req.body.options,
            "url": req.body.url,
            "author": req.uid,
            "created": "2024-09-26 19:15:46"  
        }
    });
}

async function create_item_file(req, res, next) { 
    //res.json({error: false})
    if (!req.files || !req.files.file)
        return res.json({error: true})
    //console.log(req.files)
    const file = req.files.file
    const filename = Date.now()+'-'+file.name
    const filepath = path.join(__dirname, '../../uploads', filename)
    //console.log(filepath)
    req.files.file.mv(filepath, (err) => {
        if (err) return res.json({error: true})
    });
    //console.log(req.body)
    const query = `INSERT INTO items(id_card,type,content,options,file,url,author) VALUES(?,?,?,?,?,?,?)`
    const [result] = await sql.query(query,[req.body.id_card,req.body.type,req.body.content,req.body.options,filename,req.body.url,req.uid]);
    res.json({
        error: false, 
        item:{
            "id": result.insertId,
            "id_card": req.body.id_card,
            "type": req.body.type,
            "content": req.body.content,
            "options": req.body.options,
            "file": filename,
            "url": req.body.url,
            "author": req.uid,
            "created": "2024-09-26 19:15:46"  
        }
    });
}

// **********************************************************
// UPDATE
// **********************************************************

async function update_course(req, res, next) {
    const title = req.body.title.substr(0,255)
    const query = `UPDATE courses SET title=? WHERE id=?`
    const [result] = await sql.query(query,[title,req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function update_unit(req, res, next) {
    const title = req.body.title.substr(0,255)
    const query = `UPDATE units SET title=? WHERE id=?`
    const [result] = await sql.query(query,[title,req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function update_page(req, res, next) {
    const title = req.body.title.substr(0,255)
    const query = `UPDATE pages SET title=? WHERE id=?`
    const [result] = await sql.query(query,[title,req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function update_card(req, res, next) {
    const title = req.body.title.substr(0,255)
    const query = `UPDATE cards SET title=? WHERE id=?`
    const [result] = await sql.query(query,[title,req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function update_item(req, res, next) {
    //console.log("update item",req.body.type)
    const url = req.body.url.substr(0,255)
    let fcontent = ""
    if (req.body.type=="text") { 
        //console.log("Ir a slatext")
        fcontent = await slatex(req.body.content)
    }
    if (req.body.type=="formula") {
        fcontent = await get_mathml(req.body.content)        
    }
    const query = `UPDATE items SET type=?, content=?, fcontent=?, options=?, url=? WHERE id=?`
    const [result] = await sql.query(query,[req.body.type,req.body.content,fcontent,req.body.options,url,req.body.id]);
    //console.log(result)
	res.json({error: false,fcontent});
}

// **********************************************************
// DELETE
// **********************************************************

async function delete_course(req, res, next) {
    //FALTA verificar subscriptions y eliminar cursos de courses_users
    const queryUnits = `SELECT id FROM units WHERE id_course=?`
    const [rows] = await sql.query(queryUnits,[req.body.id]);
    if (rows[0]) return res.status(400).json({error:true, mensaje:'No se puede eliminar ya que este curso contiene unidades'})
    const querySubscriptions = `SELECT id_course FROM subscriptions WHERE id_course=?`
    const [subs] = await sql.query(querySubscriptions,[req.body.id]);
    if (subs[0]) return res.status(400).json({error:true, mensaje:'No se puede eliminar ya que hay usuarios subscritos a este curso'})
    const query = `DELETE FROM courses WHERE id=?`
    const [result] = await sql.query(query,[req.body.id]);
    const query2 = `DELETE FROM courses_users WHERE id_course=?`
    const [result2] = await sql.query(query2,[req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function delete_unit(req, res, next) {
    const queryPages = `SELECT id FROM pages WHERE id_unit=?`
    const [rows] = await sql.query(queryPages,[req.body.id]);
    if (rows[0]) return res.status(400).json({error:true, mensaje:'No se puede eliminar ya que esta unidad contiene paginas'})
    const query = `DELETE FROM units WHERE id=?`
    const [result] = await sql.query(query,[req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function delete_page(req, res, next) {
    const queryCards = `SELECT id FROM cards WHERE id_page=?`
    const [rows] = await sql.query(queryCards,[req.body.id]);
    if (rows[0]) return res.status(400).json({error:true, mensaje:'No se puede eliminar ya que esta página contiene tarjetas'})
    const query = `DELETE FROM pages WHERE id=?`
    const [result] = await sql.query(query,[req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function delete_card(req, res, next) {
    const queryItems = `SELECT id FROM items WHERE id_card=?`
    const [rows] = await sql.query(queryItems,[req.body.id]);
    if (rows[0]) return res.status(400).json({error:true, mensaje:'No se puede eliminar ya que esta tarjeta contiene items'})
    const query = `DELETE FROM cards WHERE id=?`
    const [result] = await sql.query(query,[req.body.id]);
	//console.log(result)
	res.json({error: false});
}

async function delete_item(req, res, next) {
    //console.log("DELETE item",req.body.type)
    if (req.body.type=='image') {
        const filepath = path.join(__dirname, '../../uploads', req.body.file)
        //console.log("DELETE file",filepath)
        fs.unlink(filepath, (err) => {
            if (err) {
                return res.json({error: false})
            }
        })
    }
    const query = `DELETE FROM items WHERE id=?`
    const [result] = await sql.query(query,[req.body.id]);
	//console.log(result)
	res.json({error: false});
}

// **********************************************************
// UP & DOWN
// **********************************************************

async function update_unit_down(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM units WHERE id_course=? ORDER BY id`  
	const [units] = await sql.query(query,[req.body.id_course]);
    //console.log(units)
    //Get next value greater than id 
    let id_next = 0
    let i = 0
    while (id_next <= id && i<units.length) {
        id_next = units[i].id
        i++
    }
    //console.log("NEXT",id_next)
    if (id_next != id)
    {
        const query1 = `UPDATE units set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_next]);
        const query2 = `UPDATE units set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_next,id]);
        const query3 = `UPDATE units set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
	    res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_unit_up(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM units WHERE id_course=? ORDER BY id`  
	const [units] = await sql.query(query,[req.body.id_course]);
    //Get prev value lower than id 
    let id_prev = 999
    let i = units.length-1
    while (id_prev >= id && i>=0) {
        id_prev = units[i].id
        i--
    }
    if (id_prev != id)
    {
        const query1 = `UPDATE units set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_prev]);
        const query2 = `UPDATE units set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_prev,id]);
        const query3 = `UPDATE units set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
        res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_page_down(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM pages WHERE id_unit=? ORDER BY id`  
	const [pages] = await sql.query(query,[req.body.id_unit]);
    //console.log(pages)
    //Get next value greater than id 
    let id_next = 0
    let i = 0
    while (id_next <= id && i<pages.length) {
        id_next = pages[i].id
        i++
    }
    //console.log("NEXT",id_next)
    if (id_next != id)
    {
        const query1 = `UPDATE pages set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_next]);
        const query2 = `UPDATE pages set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_next,id]);
        const query3 = `UPDATE pages set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
	    res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_page_up(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM pages WHERE id_unit=? ORDER BY id`  
	const [pages] = await sql.query(query,[req.body.id_unit]);
    //Get prev value lower than id 
    let id_prev = 999
    let i = pages.length-1
    while (id_prev >= id && i>=0) {
        id_prev = pages[i].id
        i--
    }
    if (id_prev != id)
    {
        const query1 = `UPDATE pages set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_prev]);
        const query2 = `UPDATE pages set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_prev,id]);
        const query3 = `UPDATE pages set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
        res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_card_down(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM cards WHERE id_page=? ORDER BY id`  
	const [cards] = await sql.query(query,[req.body.id_page]);
    //console.log(cards)
    //Get next value greater than id 
    let id_next = 0
    let i = 0
    while (id_next <= id && i<cards.length) {
        id_next = cards[i].id
        i++
    }
    //console.log("NEXT",id_next)
    if (id_next != id)
    {
        const query1 = `UPDATE cards set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_next]);
        const query2 = `UPDATE cards set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_next,id]);
        const query3 = `UPDATE cards set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
	    res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_card_up(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM cards WHERE id_page=? ORDER BY id`  
	const [cards] = await sql.query(query,[req.body.id_page]);
    //Get prev value lower than id 
    let id_prev = 999
    let i = cards.length-1
    while (id_prev >= id && i>=0) {
        id_prev = cards[i].id
        i--
    }
    if (id_prev != id)
    {
        const query1 = `UPDATE cards set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_prev]);
        const query2 = `UPDATE cards set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_prev,id]);
        const query3 = `UPDATE cards set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
        res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_item_down(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM items WHERE id_card=? ORDER BY id`  
	const [items] = await sql.query(query,[req.body.id_card]);
    //console.log(items)
    //Get next value greater than id 
    let id_next = 0
    let i = 0
    while (id_next <= id && i<items.length) {
        id_next = items[i].id
        i++
    }
    //console.log("NEXT",id_next)
    if (id_next != id)
    {
        const query1 = `UPDATE items set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_next]);
        const query2 = `UPDATE items set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_next,id]);
        const query3 = `UPDATE items set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
	    res.json({error:false});
    } else {
        res.json({error:true});
    }
}

async function update_item_up(req, res, next) { 
    const id = req.body.id
    const query = `SELECT id FROM items WHERE id_card=? ORDER BY id`  
	const [items] = await sql.query(query,[req.body.id_card]);
    //Get prev value lower than id 
    let id_prev = 999
    let i = items.length-1
    while (id_prev >= id && i>=0) {
        id_prev = items[i].id
        i--
    }
    if (id_prev != id)
    {
        const query1 = `UPDATE items set id=99 WHERE id=?`
        const [result1] = await sql.query(query1,[id_prev]);
        const query2 = `UPDATE items set id=? WHERE id=?`
        const [result2] = await sql.query(query2,[id_prev,id]);
        const query3 = `UPDATE items set id=? WHERE id=99`
        const [result3] = await sql.query(query3,[id]);
        res.json({error:false});
    } else {
        res.json({error:true});
    }
}


// **********************************************************
// CLIPBOARD
// **********************************************************

async function get_units_from_clipboard(req, res, next) {
    //console.log("Clipboard units - User",req.uid)
    const query = `SELECT u.id, u.title FROM units_users us INNER JOIN units u
        ON us.id_unit = u.id WHERE us.id_user=?`  
	const [units] = await sql.query(query,[req.uid]);
    //console.log(query)
    //console.log("units",units)
    res.json({error:false, units})
}

async function get_pages_from_clipboard(req, res, next) {
    //console.log("Clipboard pages - User",req.uid)
    const query = `SELECT u.id, u.title FROM pages_users us INNER JOIN pages u
        ON us.id_page = u.id WHERE us.id_user=?`  
	const [pages] = await sql.query(query,[req.uid]);
    res.json({error:false, pages})
}

async function get_cards_from_clipboard(req, res, next) {
    //console.log("Clipboard cards - User",req.uid)
    const query = `SELECT u.id, u.title FROM cards_users us INNER JOIN cards u
        ON us.id_card = u.id WHERE us.id_user=?`  
	const [cards] = await sql.query(query,[req.uid]);
    res.json({error:false, cards})
}

async function get_items_from_clipboard(req, res, next) {
    //console.log("Clipboard items - User",req.uid)
    const query = `SELECT u.id, u.type, u.content, u.options, u.file FROM items_users us INNER JOIN items u
        ON us.id_item = u.id WHERE us.id_user=?`  
	const [items] = await sql.query(query,[req.uid]);
    res.json({error:false, items})
}

async function add_unit_to_clipboard(req, res, next) { 
    //console.log(add_unit_to_clipboard)
    const query = `INSERT IGNORE INTO units_users(id_user,id_unit) VALUES(?,?)`
    const [result] = await sql.query(query,[req.uid,req.body.id_unit]);
	res.json({error:false});
}

async function add_page_to_clipboard(req, res, next) { 
    const query = `INSERT IGNORE INTO pages_users(id_user,id_page) VALUES(?,?)`
    const [result] = await sql.query(query,[req.uid,req.body.id_page]);
	res.json({error:false});
}

async function add_card_to_clipboard(req, res, next) { 
    const query = `INSERT IGNORE INTO cards_users(id_user,id_card) VALUES(?,?)`
    const [result] = await sql.query(query,[req.uid,req.body.id_card]);
	res.json({error:false});
}

async function add_item_to_clipboard(req, res, next) { 
    const query = `INSERT IGNORE INTO items_users(id_user,id_item) VALUES(?,?)`
    const [result] = await sql.query(query,[req.uid,req.body.id_item]);
	res.json({error:false});
}

async function update_unit_course(req, res, next) { 
    const query = `UPDATE units set id_course=? WHERE id=?`
    const [result] = await sql.query(query,[req.body.id_course,req.body.id_unit]);
    const queryDelete = `DELETE FROM units_users WHERE id_unit=? AND id_user=?`
    const [result2] = await sql.query(queryDelete,[req.body.id_unit,req.uid]);
    const queryUnit = `SELECT id, title FROM units WHERE id=?`  
	const [unit] = await sql.query(queryUnit,[req.body.id_unit]);
	res.json({error:false, "unit":unit[0]});
}

async function update_page_unit(req, res, next) { 
    const query = `UPDATE pages set id_unit=? WHERE id=?`
    const [result] = await sql.query(query,[req.body.id_unit,req.body.id_page]);
    const queryDelete = `DELETE FROM pages_users WHERE id_page=? AND id_user=?`
    const [result2] = await sql.query(queryDelete,[req.body.id_page,req.uid]);
    const queryPage = `SELECT id, title FROM pages WHERE id=?`  
	const [page] = await sql.query(queryPage,[req.body.id_page]);
	res.json({error:false, "page":page[0]});
}

async function update_card_page(req, res, next) { 
    const query = `UPDATE cards set id_page=? WHERE id=?`
    const [result] = await sql.query(query,[req.body.id_page,req.body.id_card]);
    const queryCard = `SELECT id, title FROM cards WHERE id=?`  
	const [card] = await sql.query(queryCard,[req.body.id_card]);
	res.json({error:false, "card":card[0]});
}

async function update_item_card(req, res, next) { 
    const query = `UPDATE items set id_card=? WHERE id=?`
    const [result] = await sql.query(query,[req.body.id_card,req.body.id_item]);
	const queryItem = `SELECT id, type, content, options, file, url FROM items WHERE id=?`
    const [item] = await sql.query(queryItem,[req.body.id_item]);
    res.json({error:false, "item":item[0]});
}

// **********************************************************
// Mathjax API
// **********************************************************

async function slatex(content) {
    let pos = content.indexOf("$latex=")
    while (pos!=-1) {
        let num = content.length
        let i = pos+8
        if (i>=num)
        {
            return content 
        }       
        while (content.charAt(i)!="'" && i<num) {
            i++ 
        }
        if (content.charAt(i)!="'") {
            return content
        }
        let mathml = await get_mathml(content.substring(pos+8,i))
        if (i+1 < num)
            content = content.substring(0,pos)+mathml+content.substring(i+1)
        else
            content = content.substring(0,pos)+mathml
        pos = content.indexOf("$latex=")
    }
    return content
}

async function get_mathml(content) {
    // Create and await a promise that rejects and resolves
    // with the callback's `err` and `user` arguments, respectively
    try {
        const data = await new Promise((resolve, reject) => {
            mjAPI.typeset({
                math: content,
                format: "TeX", // or "inline-TeX", "MathML"
                mml:true,      // or svg:true, or html:true
            }, function (data) {
                if (data.errors) {
                    reject(data.errors);
                    return;
                }
                resolve(data)
            });
        });
        //console.log("get_mathml",data)
        return data.mml;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    get_all_courses, 
    get_course,
    get_unit, 
    get_page,
    get_card,
    create_course,
    create_unit,
    create_page,
    create_card,
    create_item_content,
    create_item_file,
    update_course,
    update_unit,
    update_page,
    update_card,
    update_item,
    delete_course,
    delete_unit,
    delete_page,
    delete_card,
    delete_item,
    get_units_from_clipboard,
    get_pages_from_clipboard,
    get_cards_from_clipboard,
    get_items_from_clipboard,
    add_unit_to_clipboard,
    add_page_to_clipboard,
    add_card_to_clipboard,
    add_item_to_clipboard,
    update_unit_course,
    update_page_unit,
    update_card_page,
    update_item_card,
    update_unit_down,
    update_unit_up,
    update_page_down,
    update_page_up,
    update_card_down,
    update_card_up,
    update_item_down,
    update_item_up
}

