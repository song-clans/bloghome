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


router.get('/home/test', (req,res)=>{
    // var sql = "select JSON_OBJECT('id',id,'password',password,'name',name,'my_home',my_home) from user_table"
    var sql = "select * from user_table"
    db.query(sql,function(err,rows){
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error')
        }
        // console.log(rows)

        res.render('contents/test',{data:rows})
    })

})

router.get('/home/test2', (req,res)=>{
    res.render('blog/test1')
})

router.get('/main_home', (req, res)=>{
    var sql = "select * from blog_menutable where main_img_url !='init' order by view_plus desc"
    db.query(sql,function(err,rows){
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error')
        }

        var session = req.session.passport
        console.log(session)
        if (session){
            if(err){
                console.log("user_table",err);
            }
            sql = `select * from blog_table where id = '${session.user[1]}'`
            db.query(sql,(err,blog_row)=>{
                if(err){
                    console.log("blog_table",err)
                }
                var blog_url = "http://localhost:8080/"+blog_row[0].blog_url

                res.render('contents/main_home', {data:rows,name:session,blog_url:blog_url})

            })
        }else{
            res.render('contents/main_home', {data:rows,name:"0"})
        }
    })
});

router.post('/main_home/viewup', (req,res)=>{
    var up_sql = "UPDATE blog_menutable SET view_plus = view_plus + 1 WHERE content_id=? and title_no=? and de_menu=?"
    var up_params = [req.body.contet_id,req.body.title_no,req.body.de_menu]
    db.query(up_sql,up_params)
})

router.get('/map', (req, res)=>{
    res.render('contents/map');
});

router.get('/map2', (req, res)=>{
    res.render('contents/map2');
});

router.get('/map3', (req, res)=>{
    res.render('contents/map3');
});


// router.get('/home/:no',(req,res)=>{
//     var session = req.session.passport
//     if(session){
//         var sql = 'select * from home';
//         db.query(sql,(err,results)=>{
//             var number = req.params.no;
//             if(number){
//                 var sql = `select * from home where no = ${number}`
//                 db.query(sql,(err,result)=>{
//                     if(err){
//                         // console.log(err);
//                         res.status(500).send('server Err');
//                     }
//                     else{
//                         // console.log(result)
//                         res.render('contents/detail',{datas:results, data:result[0]});
//                     }
//                 })
//             }
//             else{
//                 res.render('contents/detail',{datas:results, data:undefined})
//             }     
//         });
//     }else{
//         res.send("회원가입 하세요")//회원가입이 필요한정보
//     }
// });


// router.get('/home_top', (req, res)=>{
//     res.render('home/home_top');
// });

module.exports = router;