var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const crypto = require('crypto');
const dot = require('dotenv');
dot.config();
var app = express();

var db = mysql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'test',
})


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



passport.serializeUser((user,done)=>{
    var user_data = new Array();
    user_data[0] = user.name;
    user_data[1] = user.id;

    done(null,user_data);
});

passport.deserializeUser((id,done)=>{
    db.query(`select * from user_table where id="${id}"`,(err,rows)=>{
        var user = rows[0];
        done(err,user);
    });
});

passport.use(new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password'
}, (username,password,done)=>{
    

    db.query(`select * from user_table where id="${username}"`,(err,rows)=>{
        var user = rows[0];
        //PASSWORD 데이터베이스에 가져와서 복호화
        if(user){
            var decipher = crypto.createDecipher('aes192', username);
            decipher.update(user.password, 'base64', 'utf8');
            var decipherpassword = decipher.final('utf8');
        }
        if(err){
            return done(err);
        }
        if(!user){
            return done(null,false,{message:"incorrect username."});
        }
        if(decipherpassword !== password){
            return done(null,false,{message:"password."});
        }
        return done(null,user);
    })
}
))


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



router.route('/home_login')
.get((req,res)=>{

    var session_err = req.session.flash;

    if(session_err){
        if(session_err.error == "password"){
            // res.send("비번 틀림")
        }
        else{
            // res.send("아이디 틀림")
        }
    }   //오류 부분

    var session = req.session.passport
    var sql = "select * from home"
    db.query(sql,function(err,rows){
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error')
        }
        console.log(session)
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
            res.render('login/home_login')
        }
    });

}).post(passport.authenticate('local',{
    successRedirect:'/home_login',
    failureRedirect:'/home_login',
    failureFlash:true
}));

// router.get('/blog_login',(req,res)=>{
//     res.render('login/blog_login');
// })

router.route('/blog_login/:url1/:url2/:url3')
.get((req,res)=>{
    var session_err = req.session.flash;

    if(session_err){
        if(session_err.error == "password"){
            // res.send("비번 틀림")
        }
        else{
            // res.send("아이디 틀림")
        }
    }   //오류 부분
    
    res.render('login/blog_login',{url:req.url})
})

router.post('/blog_login/:url1/:url2/:url3',passport.authenticate('local'),(req,res)=>{
    var url = req.body.url
    var re_url = url.replace("/blog_login","")
    res.redirect(re_url);
})



//로그아웃 부분 세션 없애기
router.post('/logout', (req, res)=>{
    // console.log(req.body)
    req.session.destroy();

    // console.log(req.session)
    res.redirect('/main_home');
});

router.get('/sign_up', (req, res)=>{
    res.render('login/sign_up');
});

router.post('/sign_up', (req, res)=>{
    // console.log(req.body);
    if (req.body){
        if(req.body.user_pw != req.body.user_pw2){
            res.send("비밀번호가 틀립니다")         //1,2 비밀번호 틀리면 오류 부분
        }
        else if(req.body.user_name.length == 0 || req.body.user_id.length == 0 || req.body.user_pw.length == 0){
            res.send("입력해주세요")
        }else{
            //db에 암호화해서 넣기
            var cipher = crypto.createCipher('aes192',req.body.user_id)
            cipher.update(req.body.user_pw,'utf8','base64');
            var cipherpassword = cipher.final('base64');

            var params = [req.body.user_id,cipherpassword,req.body.user_name]
            var sql = 'insert into user_table (id,password,name) values (?,?,?)'

            // console.log(sql)

            db.query(sql,params, (err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("success");
                    res.redirect("/home_login");
                }
            })
        }

    }
});

module.exports = router;