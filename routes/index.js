// const dot = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const router = express.Router();




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


router.get('/main_home', (req, res)=>{
    
    var sql = "select * from home"
    db.query(sql,function(err,rows){
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error')
        }

        var session = req.session.passport
        if (session){
            sql = "select my_home from user_table where name =? and id=?"
            var params = [session.user[0],session.user[1]]
            db.query(sql,params,(err,row)=>{
                if(err){
                    console.log("user_talbe",err);
                }

                var data_yn = row[0].my_home
                // console.log(data_yn)
                if(data_yn == "Y"){
                    sql = `select * from blog_table where id = '${session.user[1]}'`
                    db.query(sql,(err,blog_row)=>{
                        if(err){
                            console.log("blog_table",err)
                        }
                        var blog_url = "http://localhost:8080/"+blog_row[0].blog_url

                        res.render('contents/main_home', {data:rows,name:session,data_yn:data_yn,blog_url:blog_url})

                    })
                }else{
                    res.render('contents/main_home', {data:rows,name:session,data_yn:data_yn})
                }
            })
        }else{
            res.render('contents/main_home', {data:rows,name:"0"})
        }
    })
});



// router.get('/home/', (req, res)=>{
//     res.render('contents/home');
// });

router.get('/map', (req, res)=>{
    res.render('contents/map');
});

// router.get('/home_left', (req, res)=>{
//     var session = req.session.passport
//     if(session){
//         res.render('home/home_suc_left');
//     }else{
//         res.render('home/home_left');
//     }
// });

// router.get('/home_right', (req, res)=>{
//     var sql = "select * from home"
//     db.query(sql,function(err,rows){
//         if(err) {
//             console.log(err);
//             res.status(500).send('Internal Server Error')
//         }
//         var session = req.session.passport
//         if (session){
//             sql = "select my_home from user_table where name =? and id=?"
//             var params = [session.user[0],session.user[1]]
//             db.query(sql,params,(err,row)=>{
//                 if(err){
//                     console.log("user_talbe",err);
//                 }

//                 var data_yn = row[0].my_home
//                 // console.log(data_yn)
//                 if(data_yn == "Y"){
//                     sql = `select * from blog_table where id = '${session.user[1]}'`
//                     db.query(sql,(err,blog_row)=>{
//                         if(err){
//                             console.log("blog_table",err)
//                         }
//                         var blog_url = "http://localhost:8080/"+blog_row[0].blog_url

//                         res.render('home/home_suc_right', {data:rows,name:session,data_yn:data_yn,blog_url:blog_url})

//                     })
//                 }else{
//                     res.render('home/home_suc_right', {data:rows,name:session,data_yn:data_yn})
//                 }
//             })
//         }else{
//             res.render('home/home_right', {data:rows})
//         }
//     });
// });

router.get('/home/:no',(req,res)=>{
    var session = req.session.passport
    if(session){
        var sql = 'select * from home';
        db.query(sql,(err,results)=>{
            var number = req.params.no;
            if(number){
                var sql = `select * from home where no = ${number}`
                db.query(sql,(err,result)=>{
                    if(err){
                        // console.log(err);
                        res.status(500).send('server Err');
                    }
                    else{
                        // console.log(result)
                        res.render('contents/detail',{datas:results, data:result[0]});
                    }
                })
            }
            else{
                res.render('contents/detail',{datas:results, data:undefined})
            }     
        });
    }else{
        res.send("회원가입 하세요")//회원가입이 필요한정보
    }
});


// router.get('/home_top', (req, res)=>{
//     res.render('home/home_top');
// });

module.exports = router;