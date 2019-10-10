var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')
var multer = require('multer')
var multerS3 = require('multer-s3')
var AWS = require('aws-sdk')
const dot = require('dotenv');
dot.config();

AWS.config.loadFromPath(__dirname+"/../config/awsconfig.json")
var s3 = new AWS.S3()

var db = mysql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'test',
})

var upload = multer({storage:multerS3({
    s3:s3,
    bucket:`${process.env.AWS_S3_NAME}`,
    key:function(req,file,cb){
        var upfile_name = Date.now() + "-" + file.originalname 
        var session = req.session.passport
        var update_file=`${process.env.AWS_HTTP}${upfile_name}`
        if(session){
            var sql = `update blog_table set image_url='${update_file}',file_name='${upfile_name}' where id = "${session.user[1]}"`
            db.query(sql)
            cb(null, upfile_name)
        }
    },
    acl:'public-read-write',
    })
})

router.post('/blog/:user_name/:blog_name/save_ok',upload.single('file_sel'),function(req,res){
    if(req){
        var session = req.session.passport
        var sql = 'select * from blog_table where id =?';
        var params = req.params.user_name
        var x_point = req.body.image_xpoint

        var menu = req.body.menuaddname
        
        db.query(sql,params,function(err,row){
            if(err){
                console.log("save_ok post err")                
            }
            if(row[0].image_xpoint != x_point){
                sql = `update blog_table set image_xpoint='${x_point}' where id = "${session.user[1]}"`
                db.query(sql)
            }
            if(menu){
                sql = `update blog_table set menu='${menu}' where id = "${session.user[1]}"`
                db.query(sql)
            }
            res.render('blog/blog_save')
        })
    }
});

router.get("/blog/:user_name/:blog_name/:param",function(req,res){
    var param = req.params.param
    if(param == "edit"){
        var session = req.session.passport
        var re_url = req.url.replace("/edit","/save_ok")
        if(session){
            var sql = `select * from blog_table where id = "${session.user[1]}"`
            db.query(sql,function(err,row){
                fs.readFile('/blog_edit','utf-8',function(err,data){
                    res.render("blog/blog_edit", {url:req.url, re_url:re_url,alldata:row[0]})
                })  
            })
        }else{
            res.send("잘못된 접근 입니다.")
        }
    }else if(param == "save_ok"){
        res.render('blog/blog_save')
    }
    else{
        res.send("잘못된 접근 입니다.")
    }
})

module.exports = router;