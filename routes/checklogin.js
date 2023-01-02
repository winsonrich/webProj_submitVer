// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient, url = "mongodb://localhost:27017/";
router.get('/',(req,res)=>{
  if(req.session.username==undefined)  res.render('login');
  else res.render('/menu');

}).get('/logout',(req,res)=>{
  delete req.session.username;
  res.redirect("/login");
})
.post("/",async(req,res)=>{
  const conn = await MongoClient.connect(url);
  console.log("req.body", req.body);
  let user = await conn.db("systemofschool").collection("login").findOne({
    liname: req.body.liname,
    password: req.body.password
  });
  if(user==null)res.render('login',{ alertmsg: 'login failed!' });
  else{
    req.session.username=req.body.liname;
    res.redirect("/menu");
  }
  conn.close();
});
module.exports = router;