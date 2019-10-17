var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const crypto = require('crypto');
const dot = require('dotenv');
dot.config();



var db = mysql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'test',
})


router.post('/react_login', (req,res)=>{
    var username = req.body.username
    var password = req.body.password
    // console.log(req.query)
    var sql = `select * from user_table where id="${username}"`
    console.log(sql)
    db.query(sql,function(err,row){
        // console.log(row)
       if(row[0]){
            var decipher = crypto.createDecipher('aes192', username);
            decipher.update(row[0].password, 'base64', 'utf8');
            var decipherpassword = decipher.final('utf8');
            if(password == decipherpassword){
                res.json("true")
            }else{
                res.json("false")
            }
       }else{
           res.json("아이디가 없음")
       }
    })
})


router.post('/react_user_view', (req,res)=>{
    var email = req.body.email    // var firstname = req.body.firstname
    // var lastname = req.body.lastname
    // var nickname = req.body.nickname
    // var home_top_image = req.body.home_top_image
    // var profile_image = req.body.profile_image
    
    var sql = `select * from react_test_user where email="${email}"`
    console.log(sql)
    db.query(sql,function(err,row){
        res.json(row[0])
    })
})

router.post('/react_user_save', (req,res)=>{
    var email = req.body.email
    var firstname = req.body.firstname
    var lastname = req.body.lastname
    var nickname = req.body.nickname
    var home_top_image = req.body.home_top_image
    var profile_image_url = req.body.profile_image_url
    var params =[email,firstname,lastname,nickname,home_top_image,profile_image_url]

    console.log(req.body)

    var sql = 'insert into react_test_user (email,firstname,lastname,nickname,home_top_image,profile_image_url) values (?,?,?,?,?,?)'
    // console.log(sql)
    db.query(sql,params)
    console.log("update ok")
    res.json("ok")
})

router.post('/react_test_contents', (req,res)=>{
    var email = req.body.email
    var contents = req.body.description
    var title = req.body.title
    var image = "test"
    var params =[email,contents,image,title]

    console.log(req.body)

    var sql = 'insert into react_test_content (email,contents,image,title) values (?,?,?,?)'
    // console.log(sql)
    db.query(sql,params)
    console.log("update ok")
    res.json("ok")
})

module.exports = router;