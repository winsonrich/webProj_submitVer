// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.get('/',(req,res)=>{
    if(req.session.username==undefined) {res.render('login', {alertmsg: ''});}
    else {res.render('searchstudent', {alertmsg: ''});}  //render search student page
  }).get('/logout',(req,res)=>{  
    delete req.session.username;
    res.redirect("/login");
});

router.post('/', async(req, res, next) => {
     let s={};
    let sId = req.body.sId; 
    if (sId != "") s.sid= Number(sId);
    let stdName = req.body.stdName.trim();
    if (stdName !="") s.sname= {$regex: stdName, $options: 'i'};
    let classId = req.body.classId.trim();
    if (classId !="") s.clid= {$regex: classId, $options: 'i'};
    let doB = req.body.doB.trim();
    if (doB !="") s.dob= {$regex: doB.replaceAll("-", "\\-"), $options: 'i'};
    let gender1 = req.body.gender1.trim();
    if (gender1 !="") s.gender= {$regex: gender1, $options: 'i'};
    console.log(Object.keys(s).length); 

    const conn = await MongoClient.connect(url);
    if (Object.keys(s).length==0){
        res.render('searchstudent', {alertmsg: 'Please enter search item!'});
    }else if (await conn.db("systemofschool").collection("student").countDocuments(s) ==0){
        res.render('searchstudent', {alertmsg: 'No result found!'});   
    } else {    
        res.render('liststudent',
            {list: await conn.db("systemofschool").collection("student").find(s).toArray(), errmsg: ''}
        );
    };
    conn.close();   

})

module.exports = router;