// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.get('/', async(req, res, next)=> {
  if(req.session.username==undefined)  {
    console.log("checking:",req.session.username==undefined);
    res.redirect('login');
  }else{
    const conn = await MongoClient.connect(url);
    const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
    conn.close();  }
});

module.exports = router;