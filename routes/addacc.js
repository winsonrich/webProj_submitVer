// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) -->
var express = require('express');
var router = express.Router();
var validator = require('validator')
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.get('/', async(req, res, next)=>{
  const conn = await MongoClient.connect(url);
  const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
  if(req.session.username==undefined){
    res.render('login',{alertmsg: ''});
  } else if (userInfo.role=="manager"){
    res.render('addacc',{ alertmsg: '',
    list: await conn.db("systemofschool").collection("login").find({"role":"staff"}).toArray()
    });
  } else {
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
  }
  conn.close();
});

router.post('/', async (req, res) =>{
  const conn = await MongoClient.connect(url);
  let newName = req.body.liname.trim();
  let password = req.body['password'];
  let confirmpassword=req.body['confirmpassword'];
  
  if (await conn.db("systemofschool").collection("login").countDocuments(
    { 'liname': newName }) !=0 ){
      res.render('addacc',{alertmsg: 'Username already exists!'});   
    } else if (newName == '' || password== ''){
      res.render('addacc',{alertmsg: 'Please enter username or password!'});
    } else if (!(validator.isAlphanumeric(newName))) {
      res.render('addacc',{alertmsg: 'No special character is allowed for username.'});
    } else if (password != confirmpassword){
      res.render('addacc',{alertmsg: 'Passwords do not match!'});
    } else if (!(validator.isStrongPassword(password, {minLength:6, minLowercase:0, minUppercase:0, minNumbers:0})))  {
      res.render('addacc',{alertmsg: 'Include 6 or more characters with at least one special character for password.'});
    } else  {    
      await conn.db("systemofschool").collection("login").insertOne({"liname": newName, "password": password, "role":req.body.class});
      res.render('addacc',{alertmsg: 'Account Created!'}); 
    }; 
  conn.close();
});
    
module.exports = router;