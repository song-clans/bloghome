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

var image_url = new Array()
var image_name = new Array()
var image_main = "init"

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

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
        var update_file=`${process.env.AWS_HTTP}/${upfile_name}`
        if(session){
            var sql = `update blog_table set image_url='${update_file}',file_name='${upfile_name}' where id = "${session.user[1]}"`
            db.query(sql)
            cb(null, upfile_name)
        }
    },
    acl:'public-read-write',
    })
})

var arrupload = multer({storage:multerS3({
    s3:s3,
    bucket:`${process.env.AWS_S3_NAME_ARR}`,
    key:function(req,file,cb){

        // console.log("asdasd",file)
        var upfile_name = Date.now() + "-" + file.originalname 
        var session = req.session.passport
        var update_file=`${process.env.AWS_HTTP_ARR}/${upfile_name}`
        image_url.push(update_file)
        image_name.push(file.originalname)
        if(image_main == 'init'){
            image_main = update_file;
        }else{
            console.log("데이터 있음")
        }

        cb(null, upfile_name)
        if(session){
            cb(null, upfile_name)
        }
    },
    acl:'public-read-write',
    })
})

router.post('/blog/:user_name/:blog_name/detail/:menu/:page/save_ok',arrupload.array('edit_file_sel',10),function(req,res){
    var session = req.session.passport
    var be_filename = req.body.popContent.match(/id="([^"]+)/ig)
    var title = req.body.subject
    var body = req.body.popContent
    var title_no = 0
    var url_text = ""
    // console.log(body)
    if(be_filename){
        // console.log("1",be_filename)
        body = req.body.popContent.replace(/id([^>]+)/ig,"a")
        for(var i=0; i<image_url.length; i++){
            be_filename[i] = be_filename[i]+'"'
        }
        while(true){
            var search = be_filename.indexOf('undefined"');
            if(search != -1){
                be_filename.splice(search,1);
            }else{
                break;
            }
        }
        // console.log(image_url)
        // console.log(image_name)
        // console.log(be_filename)
        for(i=0; i<be_filename.length; i++){
            // console.log("2",be_filename)
            var be_orgin_filename = be_filename[i].match(/id="([^"]+)/i)
            for(var j=0; j<image_name.length; j++){
                if(be_orgin_filename[1] == image_name[j]){
                    // console.log("3",image_url[j])
                    url_text = url_text+"|"+image_url[j]
                    body = body.replace(/(img a)/i,`img src="${image_url[j]}" id ="img${j}" name ="img${j}" style="width:auto; height:150px; overflow:hidden;"`)
                    // console.log("4",body)
                    sleep(500)
                }
            }
        }
    }
    if(title){
        // console.log(sleep_no)
        // console.log(Number(sleep_no))
        // console.log("5",body)
        var sql ="select * from blog_table where pass_name = ?"
        
        db.query(sql,req.params.user_name,(err,id)=>{

            sql = "select * from blog_menutable where content_id=? and de_menu =? order by title_no desc"
            var sel_par = [id[0].id,req.params.menu]

            db.query(sql,sel_par,(err,row)=>{
                if(row[0]){
                    title_no = row[0].title_no + 1
                }else{
                    title_no = 1
                }
                var blog_detailurl = `/blog/${req.params.user_name}/${req.params.blog_name}/detail/${req.params.menu}/page/${title_no}`
                // if(session){
                var param = [session.user[1],blog_detailurl,title,body,req.params.menu,title_no,0,image_main,('{"lat":"0","lng":"0"}'),url_text,0]
                sql = "insert into blog_menutable values(?,?,?,?,?,?,?,?,?,?,?)"
                db.query(sql,param)

                image_main="init"
                // }
            })
        })
        
    }
    
    image_name = []
    image_url = []
    
    res.redirect(`/blog/${req.params.user_name}/${req.params.blog_name}/detail/${req.params.menu}/1`);
})


router.post('/blog/:user_name/:blog_name/save_ok',upload.single('file_sel'),function(req,res){
    if(req){
        var session = req.session.passport
        var sql = 'select * from blog_table where id =?';
        var params = req.params.user_name
        var x_point = req.body.image_xpoint
        var menu = req.body.menuaddname;
    
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
    }
    else{
        res.send("잘못된 접근 입니다.")
    }
})

router.get('/blog/:user_name/:blog_name/detail/:menu/:page/:param', (req, res)=>{
    var session = req.session.passport

    var params = req.params.user_name


    var param = req.params.param

    if(param == 'edit'){
        var re_url = req.url.replace("/edit","/save_ok")
        // var sql ='SELECT * FROM blog_table AS a join blog_menutable AS b ON (a.id = b.id) WHERE a.id = ? AND b.de_menu = ?'
        var sql = 'select * from blog_table where pass_name =?'
        db.query(sql,params,(err,row)=>{
            if(row[0]){
                if(session){
                    fs.readFile('/blog_contentedit','utf-8',function(err,data){
                        res.render('blog/blog_contentedit',{name:session,re_url:re_url,alldata:row[0]});
                    })  
                }else{
                    // fs.readFile('blog/blog_contentedit', function(err,data){
                    //     console.log(data)
                    //     res.writeHead(200,{'Content-Type':'text/html'});
                    res.render('blog/blog_contentedit',{name:"0",re_url:re_url,alldata:row[0]});
                        // res.end(data)
                    // })
                }
            }
        })
    }
    else{
        // console.log(err);
        // res.render('blog/blog_basic',{name:"0",image_url:row[0].image_url,x_point:row[0].image_xpoint});
        res.send('잘못된 접근입니다.');
    }
});

module.exports = router;