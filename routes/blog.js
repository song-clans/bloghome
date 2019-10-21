// const dot = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const dot = require('dotenv');
dot.config();

var db = mysql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'test',
})


router.get('/blog_create', (req, res)=>{
    var session = req.session.passport
    res.render('blog/blog_create',{name:session});
});


router.get('/blog/:user_name/:blog_name/',(req,res)=>{
    var session = req.session.passport
    var sql = 'select * from blog_table where id =?';
    var params = req.params.user_name
    db.query(sql,params,(err,row)=>{
        if(row[0]){
            if(session){
                res.render('blog/blog_basic',{name:session,login:params,alldata:row[0]});
            }else{
                res.render('blog/blog_basic',{name:"0",login:params,alldata:row[0]});
            }
        }else{
            // console.log(err);
            // res.render('blog/blog_basic',{name:"0",image_url:row[0].image_url,x_point:row[0].image_xpoint});
            res.send('잘못된 접근입니다.');
        }
    })
})


router.get('/blog_edit',(req,res)=>{
    var session = req.session.passport
    console.log(session);
    console.log(req.body.blog_name)

    var blog_url = "blog/userid"+session.user[1]

    var params = [session.user[1],session.user[0],req.body.blog_name,blog_url]
    var sql = "insert into blog_table (id,user_name,blog_name,blog_url) values (?,?,?,?)"
    db.query(sql,params,(err,row)=>{
        if(err){
            console.log(err);
        }else{
            sql = `update user_table set my_home='Y' where id ="${session.user[1]}" and name ="${session.user[0]}"`
            db.query(sql,(err,row)=>{
                if(err){
                    console.log(err);
                }
            })
            console.log("Ok")
        }
    })

    res.render('blog/blog_edit');
})


router.post('/blog_create', (req, res)=>{
    if (req.body){
        if(req.body.blog_name.length < 1){
            //이름 길이 1 이상
        }else{
            var session = req.session.passport

            var blog_url = "blog/"+session.user[1]+"/"+req.body.blog_name

            var params = [session.user[1],session.user[0],req.body.blog_name,blog_url]
            var sql = "insert into blog_table (id,user_name,blog_name,blog_url) values (?,?,?,?)"
            db.query(sql,params,(err,row)=>{
                if(err){
                    console.log(err);
                }else{
                    sql = `update user_table set my_home='Y' where id ="${session.user[1]}" and name ="${session.user[0]}"`
                    db.query(sql,(err,row)=>{
                        if(err){
                            console.log(err);
                        }
                    })
                    console.log("Ok")
                    // res.render('blog/blog_basic',{name:session})
                    res.redirect(blog_url);
                }
            })
        }

    }
});

router.get('/blog/:user_name/:blog_name/detail/:menu', (req, res)=>{
    var session = req.session.passport
    // var sql = 'select * from blog_table where id =?';
    var menu_params = req.params.menu
    // var params = [req.params.user_name,menu_params]
    var params = req.params.user_name
    // var sql ='SELECT * FROM blog_table AS a join blog_menutable AS b ON (a.id = b.id) WHERE a.id = ? AND b.de_menu = ?'
    var sql = "select * from blog_table where id = ?"
    db.query(sql,params,(err,row)=>{
        if(row[0]){
            if(session){
                res.render('blog/blog_detailpage',{name:session,login:params,alldata:row[0]});
            }else{
                res.render('blog/blog_detailpage',{name:"0",login:params,alldata:row[0]});
            }
        }else{
            // console.log(err);
            // res.render('blog/blog_basic',{name:"0",image_url:row[0].image_url,x_point:row[0].image_xpoint});
            res.send('잘못된 접근입니다.');
        }
    })
});


module.exports = router;