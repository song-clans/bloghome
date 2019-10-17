var express = require('express');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var passport = require('passport')
var session =require('express-session');
var loginRouter = require('./routes/login');
var flash = require('connect-flash');
var blogRouter = require('./routes/blog')
var fileRouter = require('./routes/file')
var react_nativeRouter = require('./routes/react_native')
var app = express();


app.use("/public",express.static(__dirname+"/public"));

app.use(session({
    secret : 'secret',
    resave : false,
    saveUninitialized : false,
    cookie: {
        maxAge: 2000 * 60 * 60 //지속시간 2시간
      },
}));

app.use(flash());
app.use(passport.initialize());

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.set('html',require('ejs').renderFile);

app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(bodyParser.json({limit:'50mb'}))
app.use('/',indexRouter)
app.use('/',loginRouter)
app.use('/',blogRouter)
app.use('/',fileRouter)
app.use('/',react_nativeRouter)


var port = 8080;

app.listen(port, ()=>{
    console.log(`Server is started : http://localhost:${port}`)
});

