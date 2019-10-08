var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')


var multer = require('multer')



var storage = multer.diskStorage({
    destination: function(req,file,cb){
        if(file.mimetype=="image/jpeg" || file.mimetype=="image/jpg" || file.mimetype =="image/png"){
            console.log("이미지파일")
            cb(null,'uploads/images')
        }else{
            console.log("x")
        }
    },
    filename:function(req,file,cb){
        cb(null, Date.now() + "-" + file.originalname)
    }
})

var upload = multer({storage:storage})

router.post('/blog/:user_name/:blog_name/save_ok',upload.single('file_sel'),function(req,res){
    if(req){
        var session = req.session.passport
        var log_ok = req.params.user_name
        // console.log("post")
        // console.log(req.file)
        // console.log(req.file.path)
        // console.log(upload)
        // console.log(upload.storage.getFilename)
        res.render('blog/blog_basic',{name:session,login:log_ok});
        // console.log("db연결")
    }
});

router.get("/blog/:user_name/:blog_name/edit",function(req,res){
    var session = req.session.passport
    console.log(session)
    var sql = 'select * from blog_table where id =?';
    var params = req.params.user_name
    // console.log("파일 페이지")
    var path = __dirname + '/../' + 'uploads/images/'
    var re_url = req.url.replace("/edit","/save_ok")
    fs.readFile('/blog_edit','utf-8',function(err,data){
        res.render("blog/blog_edit", {url:req.url, re_url:re_url})
    })
})

module.exports = router;