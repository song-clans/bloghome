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

    // console.log(req.body)

    var sql = 'insert into react_test_user (email,firstname,lastname,nickname,home_top_image,profile_image_url) values (?,?,?,?,?,?)'
    // console.log(sql)
    db.query(sql,params)
    console.log("update ok")
    res.json("ok")
})

router.post('/react_test_contents', (req,res)=>{
    //title_no,view_plus=0,reple_count=0,blog_detaileurl 만들어줘야함
    var email = req.body.email
    var contents = req.body.description
    var title = req.body.title
    var convertedPhotos = req.body.convertedPhotos
    var position = {"lat":req.body.lat, "lng":req.body.lng}
    var main_image_url
    if (convertedPhotos[0]){
        var imagephotos = convertedPhotos[0].split(",")
        for(var i=0; i<imagephotos.length; i++){
            if(i=0){
                main_image_url = imagephotos[0]
            }
        }
    }
    
    // var image = req.body.image
    // var params =[email,contents,title,convertedImg,lat,lng]

    console.log(req.body)


    // var sql = 'insert into blog_menutable (content_id,blog_detailurl,title,content,de_menu,title_no,view_plus,main_img_url,position,reple_count) values (?,?,?,?,?,?,?,?,?,?)'
    // console.log(sql)
    // db.query(sql,params)
    // console.log("update ok")
    res.json("ok")
})

router.post('/react_content_select', (req,res)=>{
    var email = req.body.email
    // console.log(req.body)

    var sql = `select * from react_test_content where email="${email}"`
    // console.log(sql)
    db.query(sql,(err,row)=>{
        res.json(row)
    })
    // console.log("update ok"))
})

router.post('/react_native_login',(req,res)=>{
    console.log(req.body)
    if(req.body[0].providerId == "google.com"){
        var sql = "select * from blog_table where id =?"
        
        db.query(sql,req.body[0].email,(err,row)=>{
            if(row[0]){
                console.log("이미 데이터가 있음")
            }else{
                console.log("새로 google 들어옴")

                sql = 'insert into user_table (id,password,nickname,name,profile_url) values (?,?,?,?,?)'
                var cipher = crypto.createCipher('aes192',req.body[0].email)
                cipher.update("googlelogin",'utf8','base64');
                var cipherpassword = cipher.final('base64');
        
                params = [req.body[0].email,cipherpassword,req.body[0].displayName,req.body[0].displayName,req.body[0].photoURL]
        
                db.query(sql,params)
        
                var blog_cipher = crypto.createCipher('aes192',"tripco")
                blog_cipher.update(req.body[0].email,'utf8','base64');
                var blog_cipher_id = blog_cipher.final('base64');
                
                blog_cipher_id =blog_cipher_id.replace(/\//g,"")
        
                var blognick_cipher = crypto.createCipher('aes192',"tripco")
                blognick_cipher.update(req.body[0].displayName,'utf8','base64');
                var blog_cipher_nick = blognick_cipher.final('base64')
                
                blog_cipher_nick = blog_cipher_nick.replace(/\//g,"")
        
                var blog_url = "blog/"+blog_cipher_id+"/"+blog_cipher_nick
                var blog_sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu,pass_name) values (?,?,?,?,'전체글',?)"
        
                var blog_params = [req.body[0].email,req.body[0].displayName,req.body[0].displayName,blog_url,blog_cipher_id]
                db.query(blog_sql,blog_params)
            }
        })


    }else if(req.body[0].providerId == "facebook.com"){
        // var sql = "select * from blog_table where id =?"
        
        // db.query(sql,req.body[0].uid,(err,row)=>{
        //     if(row[0]){
        //         console.log("이미 데이터가 있음")
        //     }
        //     else{

        //         console.log("새로 facebook 들어옴")

        //         sql = 'insert into user_table (id,password,nickname,name) values (?,?,?,?)'
        //         var cipher = crypto.createCipher('aes192',req.body[0].uid)
        //         cipher.update("facebooklogin",'utf8','base64');
        //         var cipherpassword = cipher.final('base64');

        //         params = [reqp.body[0].uid,cipherpassword,req.body[0].displayName,req.body[0].displayName]

        //         db.query(sql,params)

        //         var blog_cipher = crypto.createCipher('aes192',"tripco")
        //         blog_cipher.update(req.body[0].uid,'utf8','base64');
        //         var blog_cipher_id = blog_cipher.final('base64');
                
        //         blog_cipher_id =blog_cipher_id.replace(/\//g,"")

        //         var blognick_cipher = crypto.createCipher('aes192',"tripco")
        //         blognick_cipher.update(req.body[0].displayName,'utf8','base64');
        //         var blog_cipher_nick = blognick_cipher.final('base64')
                
        //         blog_cipher_nick = blog_cipher_nick.replace(/\//g,"")

        //         var blog_url = "blog/"+blog_cipher_id+"/"+blog_cipher_nick
        //         var blog_sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu,pass_name) values (?,?,?,?,'전체글',?)"

        //         var blog_params = [req.body[0].uid,req.body[0].displayName,req.body[0].displayName,blog_url,blog_cipher_id]
        //         db.query(blog_sql,blog_params)
        //     }
        // })
        console.log("facebook")

    }else{
        console.log("잘못된 경로")
    }
})

router.post('/react_native_content_save',(req,res)=>{
    console.log(req.body)
    //title_no,view_plus=0,reple_count=0,blog_detaileurl 만들어줘야함
})

module.exports = router;