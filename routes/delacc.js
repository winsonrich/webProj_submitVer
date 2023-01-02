//PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) -->
var express = require('express');
var router = express.Router();
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.get('/', async(req, res, next)=>{
  const conn = await MongoClient.connect(url);
  const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
  if(req.session.username==undefined){
    res.render('login',{alertmsg: ''});
  }else if (userInfo.role=="manager"){
    res.render('delacc',{ alertmsg: '',
    list: await conn.db("systemofschool").collection("login").find({"role":"staff"}).toArray()
    });
  }else{
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
  }
  conn.close();
});

router.post('/', async (req, res) =>{
  const conn = await MongoClient.connect(url);
  let name = req.body.targetName.trim(); 
  var delTarget = await conn.db("systemofschool").collection("login").findOne({"liname": name})
  var staffList = await conn.db("systemofschool").collection("login").find({"role":"staff"}).toArray();
  console.log(staffList)
  if (await conn.db("systemofschool").collection("login").countDocuments(
    { 'liname': name }) ==0 ){
      res.render('delacc',{alertmsg: 'Username does not exist!', list: staffList});   
    } else if (delTarget.role == "manager"){
      res.render('delacc',{alertmsg: "You cannot delete another manager's account!!", list: staffList});  
    } else  {    
        await conn.db("systemofschool").collection("login").deleteOne({"liname": name});
        let updateList = staffList.filter( el => el.liname !== name );
        res.render('delacc',{alertmsg: 'Account Deleted!', list: updateList });        
    }; 
  conn.close();
});

module.exports = router;