// const dot = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const dot = require('dotenv');
const crypto = require('crypto');
dot.config();

var db = mysql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'test',
})


// router.get('/blog_create', (req, res)=>{
//     var session = req.session.passport
//     res.render('blog/blog_create',{name:session});
// });


router.get('/blog/:user_name/:blog_name/',(req,res)=>{
    var session = req.session.passport
    var sql = 'select * from blog_table where pass_name =?';
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


// router.get('/blog_edit',(req,res)=>{
//     var session = req.session.passport
//     console.log(session);
//     console.log(req.body.blog_name)

//     var blog_url = "blog/userid"+session.user[1]

//     var params = [session.user[1],session.user[0],req.body.blog_name,blog_url]
//     var sql = "insert into blog_table (id,user_name,blog_name,blog_url) values (?,?,?,?)"
//     db.query(sql,params,(err,row)=>{
//         if(err){
//             console.log(err);
//         }else{
//             sql = `update user_table set my_home='Y' where id ="${session.user[1]}" and name ="${session.user[0]}"`
//             db.query(sql,(err,row)=>{
//                 if(err){
//                     console.log(err);
//                 }
//             })
//             console.log("Ok")
//         }
//     })

//     res.render('blog/blog_edit');
// })


// router.post('/blog_create', (req, res)=>{
//     if (req.body){
//         if(req.body.blog_name.length < 1){
//             //이름 길이 1 이상
//         }else{
//             var session = req.session.passport

//             var blog_url = "blog/"+session.user[1]+"/"+req.body.blog_name

//             var params = [session.user[1],session.user[0],req.body.blog_name,blog_url]
//             var sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu) values (?,?,?,?,'전체글')"
//             db.query(sql,params,(err,row)=>{
//                 if(err){
//                     console.log(err);
//                 }else{
//                     sql = `update user_table set my_home='Y' where id ="${session.user[1]}" and name ="${session.user[0]}"`
//                     db.query(sql,(err,row)=>{
//                         if(err){
//                             console.log(err);
//                         }
//                     })
//                     console.log("Ok")
//                     // res.render('blog/blog_basic',{name:session})
//                     res.redirect(blog_url);
//                 }
//             })
//         }

//     }
// });

router.get('/blog/:user_name/:blog_name/detail/:menu/:page', (req, res)=>{
    var session = req.session.passport
    // var sql = 'select * from blog_table where id =?';
    var menu_params = req.params.menu
    var params = req.params.user_name
    var page = req.params.page
    var sql = "select * from blog_table where pass_name = ?"
    db.query(sql,params,(err,row)=>{
        if(row[0]){
            sql = "SELECT * FROM blog_table AS a join blog_menutable AS b ON (a.id = b.content_id) WHERE a.id = ? AND b.de_menu = ? order by b.title_no desc"
            params = [row[0].id,menu_params]
            db.query(sql,params,(err,rows)=>{
                
                if(session){
                    res.render('blog/blog_detailpage',{name:session,alldata:row[0],contentdata:rows,page:page,length:rows.length-1,page_num:10});
                }else{
                    res.render('blog/blog_detailpage',{name:"0",alldata:row[0],contentdata:rows,page:page,length:rows.length-1,page_num:10});
                }
            })
        }else{
            // console.log(err);
            // res.render('blog/blog_basic',{name:"0",image_url:row[0].image_url,x_point:row[0].image_xpoint});
            res.send('잘못된 접근입니다.');
        }
    })
});

router.get('/blog/:user_name/:blog_name/detail/:menu/page/:title_no', (req, res)=>{
    var session = req.session.passport

    var sql ='SELECT * FROM blog_table AS a join blog_menutable AS b ON (a.id = b.content_id) WHERE a.pass_name = ? AND b.title_no = ? AND b.de_menu=?'

    var params = [req.params.user_name,req.params.title_no,req.params.menu]

    db.query(sql,params,(err,row)=>{
        // console.log(row)
        sql = "select * from reple_content where content_id=? and content_no=? and content_menu=? order by update_time desc"
        params = [row[0].id,req.params.title_no,req.params.menu]
        if(session){
            var up_sql = "UPDATE blog_menutable SET view_plus = view_plus + 1 WHERE content_id=? and title_no=? and de_menu=?"
            var up_params = [row[0].id,req.params.title_no,req.params.menu]
            db.query(up_sql,up_params)
            db.query(sql,params,(err,rows)=>{
                if(rows){
                    res.render('blog/blog_content_detail',{name:session,alldata:row[0],menu:req.params.menu,reple:rows});
                }else{
                    res.render('blog/blog_content_detail',{name:session,alldata:row[0],menu:req.params.menu});
                }
            })
        }else{
            var up_sql = "UPDATE blog_menutable SET view_plus = view_plus + 1 WHERE content_id=? and title_no=? and de_menu=?"
            var up_params = [row[0].id,req.params.title_no,req.params.menu]
            db.query(up_sql,up_params)
            db.query(sql,params,(err,rows)=>{
                if(rows){
                    res.render('blog/blog_content_detail',{name:"0",alldata:row[0],menu:req.params.menu,reple:rows});
                }else{
                    res.render('blog/blog_content_detail',{name:"0",alldata:row[0],menu:req.params.menu});
                }
            })
        }
    })

    // res.render('blog/blog_contentedit',{name:session,re_url:re_url,login:params[0],alldata:row[0]});
});

router.post('/reple/post',(req,res)=>{
    var session = req.session.passport
    if(session){
        var reple_text = req.body.reple_data
        var data = req.body.contenturl.split("/")
        var title_no = data[7]
        var blog_username = data[2]
        var blog_menu = req.body.menu_data
        var user_name = session.user[1]
        var nick_name = session.user[2]
        var today = new Date();
        var update_time = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
        var blog_selsql = "select * from blog_table where pass_name =?"
        
        db.query(blog_selsql,blog_username,(err,blog_name)=>{
            var sel_sql="select reple_no from reple_content where content_menu=? and content_no=? and content_id=? order by reple_no desc"

            var sel_par = [blog_menu,title_no,blog_name[0].id]

            db.query(sel_sql,sel_par,(err,row)=>{
                var count = 0
                if(row[0]){
                    count = row[0].reple_no + 1
                }
                var up_sql = "UPDATE blog_menutable SET reple_count = reple_count + 1 WHERE content_id=? and title_no=? and de_menu=?"
                var up_params = [blog_name[0].id,title_no,blog_menu]
                db.query(up_sql,up_params)
                var params = [user_name,nick_name,reple_text,title_no,blog_name[0].id,blog_menu,count,"none",update_time]
                var sql = "insert into reple_content values(?,?,?,?,?,?,?,?,?)"
                db.query(sql,params)
            })
        })
    }
})

router.post('/reple/del',(req,res)=>{
    // console.log(req.body)
    var sql = "delete from reple_content where reple_id=? and reple_no = ? and content_id =? and content_menu = ? and content_no=?"
    var params = [req.body.reple_id,req.body.reple_no,req.body.reple_blogid,req.body.reple_menu,req.body.content_no]
    var down_sql = "UPDATE blog_menutable SET reple_count = reple_count - 1 WHERE content_id=? and title_no=? and de_menu=?"
    var down_params = [req.body.reple_blogid,req.body.content_no,req.body.reple_menu]
    db.query(down_sql,down_params)
    db.query(sql,params);
})

router.post('/reple/edit',(req,res)=>{
    //update user_table set my_home='Y' where id ="${session.user[1]}" and name ="${session.user[0]}"
    var sql = "update reple_content set reple_text=? where reple_id=? and reple_no = ? and content_id =? and content_menu = ? and content_no=?"

    var up_sql = "UPDATE blog_menutable SET reple_count = reple_count + 1 WHERE content_id=? and title_no=? and de_menu=?"
    var up_params = [req.body.reple_blogid,req.body.content_no,req.body.reple_menu]
    db.query(up_sql,up_params)
    var params = [req.body.text,req.body.reple_id,req.body.reple_no,req.body.reple_blogid,req.body.reple_menu,req.body.content_no]
    db.query(sql,params);
})


module.exports = router;