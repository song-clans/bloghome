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
    var sql = `select * from user_table where id="${username}"`

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


module.exports = router;