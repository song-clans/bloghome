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

    if(user.provider=="google"){
        user_data[0] = user.displayName
        user_data[1] = user.emails[0].value
        user_data[2] = user.displayName

    }else if(user.provider=="facebook"){
        console.log(user)
        user_data[0] = user.displayName;
        user_data[1] = user.emails[0].value;
        user_data[2] = user.displayName;
    }else{
        user_data[0] = user.name;
        user_data[1] = user.id;
        user_data[2] = user.nickname;
    }
    done(null,user_data);
});

passport.deserializeUser((id,done)=>{
    db.query(`select * from user_table where id="${id}"`,(err,rows)=>{
        var user = rows[0];
        done(err,user);
    });
});


var GoogleStrategy = require( 'passport-google-oauth20' ).Strategy

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/auth/google/callback',
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            user = profile;
            return done(null, user);
        });
    }
));

router.get('/auth/google', passport.authenticate('google', { scope:
    ['profile','email','openid']}),function(req,res){
    });


router.get('/auth/google/callback', passport.authenticate( 'google', {failureRedirect: '/login' }),
    function(req, res) {
        var session = req.session.passport;
        var sql ="select * from user_table where id =?"
        var params = [session.user[1]]
        console.log(session)
        db.query(sql,params,(err,row)=>{
            if(row[0]){
                console.log("이미 있음 접속 ok")
            }else{
                sql = 'insert into user_table (id,password,nickname,name) values (?,?,?,?)'
                var cipher = crypto.createCipher('aes192',session.user[1])
                cipher.update("googlelogin",'utf8','base64');
                var cipherpassword = cipher.final('base64');

                params = [session.user[1],cipherpassword,session.user[2],session.user[0]]

                db.query(sql,params)

                var blog_cipher = crypto.createCipher('aes192',"tripco")
                blog_cipher.update(session.user[1],'utf8','base64');
                var blog_cipher_id = blog_cipher.final('base64');
                
                blog_cipher_id =blog_cipher_id.replace(/\//g,"")

                var blognick_cipher = crypto.createCipher('aes192',"tripco")
                blognick_cipher.update(session.user[2],'utf8','base64');
                var blog_cipher_nick = blognick_cipher.final('base64')
                
                blog_cipher_nick = blog_cipher_nick.replace(/\//g,"")

                var blog_url = "blog/"+blog_cipher_id+"/"+blog_cipher_nick
                var blog_sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu,pass_name) values (?,?,?,?,'전체글',?)"

                var blog_params = [session.user[1],session.user[0],session.user[2],blog_url,blog_cipher_id]
                db.query(blog_sql,blog_params)
            }
            res.render('login/login_ok')
        })
});

var FacebookStrategy = require('passport-facebook').Strategy

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/auth/facebook/callback',
        profileFields:['id','email','displayName']
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            user = profile;
            return done(null, user);
        });
    }
));

router.get('/auth/facebook', passport.authenticate('facebook', { scope:
    ['public_profile','email','uid']}),function(req,res){
        
    });


router.get('/auth/facebook/callback', passport.authenticate( 'facebook', {failureRedirect: '/login' }),
    function(req, res) {
        var session = req.session.passport;
        var sql ="select * from user_table where id =?"
        var params = [session.user[1]]
        console.log(session)
        db.query(sql,params,(err,row)=>{
            if(row[0]){
                console.log("이미 있음 접속 ok")
            }else{
                sql = 'insert into user_table (id,password,nickname,name) values (?,?,?,?)'
                var cipher = crypto.createCipher('aes192',session.user[1])
                cipher.update("facebooklogin",'utf8','base64');
                var cipherpassword = cipher.final('base64');

                params = [session.user[1],cipherpassword,session.user[2],session.user[0]]

                db.query(sql,params)

                var blog_cipher = crypto.createCipher('aes192',"tripco")
                blog_cipher.update(session.user[1],'utf8','base64');
                var blog_cipher_id = blog_cipher.final('base64');
                
                blog_cipher_id =blog_cipher_id.replace(/\//g,"")

                var blognick_cipher = crypto.createCipher('aes192',"tripco")
                blognick_cipher.update(session.user[2],'utf8','base64');
                var blog_cipher_nick = blognick_cipher.final('base64')
                
                blog_cipher_nick = blog_cipher_nick.replace(/\//g,"")

                var blog_url = "blog/"+blog_cipher_id+"/"+blog_cipher_nick
                var blog_sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu,pass_name) values (?,?,?,?,'전체글',?)"

                var blog_params = [session.user[1],session.user[0],session.user[2],blog_url,blog_cipher_id]
                db.query(blog_sql,blog_params)
            }
            res.render('login/login_ok')
        })
});


passport.use(new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
}, (username,password,done)=>{
    db.query(`select * from user_table where id="${username}"`,(err,rows)=>{
        var user = rows[0];
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

router.get('/login',(req,res)=>{
    var session_err = req.session.flash;
    var session = req.session.passport;
    if(session){
        res.send("이미 로그인 중")
    }else if(session_err){
        if(session_err.error =='password'){
            req.session.destroy();
            res.send("비번 틀림")
        }else{
            req.session.destroy();
            res.send("아이디 틀림")
        }
    }else{
        res.render("login/tot_login")
    }

}).post('/login',passport.authenticate('local',{
    successRedirect:'/login_ok',
    failureRedirect:'/login',
    failureFlash:true
}));

router.get('/login_ok', (req,res)=>{
    res.render('login/login_ok')
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

            var params = [req.body.user_id,cipherpassword,req.body.user_nickname,req.body.user_name]
            var sql = 'insert into user_table (id,password,nickname,name) values (?,?,?,?)'

            // console.log(sql)

            db.query(sql,params, (err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("success");

                    var blog_cipher = crypto.createCipher('aes192',"tripco")
                    blog_cipher.update(req.body.user_id,'utf8','base64');
                    var blog_cipher_id = blog_cipher.final('base64');
                    
                    blog_cipher_id =blog_cipher_id.replace(/\//g,"")

                    var blognick_cipher = crypto.createCipher('aes192',"tripco")
                    blognick_cipher.update(req.body.user_nickname,'utf8','base64');
                    var blog_cipher_nick = blognick_cipher.final('base64')
                    
                    blog_cipher_nick = blog_cipher_nick.replace(/\//g,"")

                    var blog_url = "blog/"+blog_cipher_id+"/"+blog_cipher_nick
                    var blog_sql = "insert into blog_table (id,user_name,blog_name,blog_url,menu,pass_name) values (?,?,?,?,'전체글',?)"

                    var blog_params = [req.body.user_id,req.body.user_name,req.body.user_nickname,blog_url,blog_cipher_id]
                    db.query(blog_sql,blog_params)

                    res.redirect("/login");
                }
            })
        }

    }
});

module.exports = router;