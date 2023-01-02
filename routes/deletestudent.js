// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');
var imgpath = "public/images/";

router.get('/', async(req, res, next)=>{
  const conn = await MongoClient.connect(url);
  const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
  if(req.session.username==undefined)  {res.render('login',{alertmsg: ''});}
  else if (userInfo.role=="manager"){
    res.render('deletestudent',{
      errmsg: '',
      list: await conn.db("systemofschool").collection("student").find().sort({sid:1}).toArray()
    });
  } else{
    const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
  }
  conn.close();
});

router.get("/delete/:id", async (req, res) =>{
    const obj = { _id: ObjectId(req.params.id)};

    // delete photo
    const conn = await MongoClient.connect(url);
    //get _id in db as an obj data type, it contains infos of that record from selected itemId in html form table
    let dbid = await conn.db("systemofschool").collection("student").findOne(obj); 
    let photo = dbid!=null ? dbid.photo : "";//if contains photo, assign to var photo

    console.log("photo:",photo,"dbid.photo:",dbid.photo,"dbid:",dbid);
    if(photo!=""){
      console.log("File delete path: ",imgpath + photo);
      await fs.promises.unlink(imgpath + photo);//delete file in upload folder after copied to images folder
      console.log("File deleted. ",imgpath + photo);
    }
    // delete record from DB
    await conn.db("systemofschool").collection("student").deleteOne(obj);
    console.log("1 document deleted");
    res.redirect("/deletestudent");
    conn.close();
});

router.post('/searchstudent', async(req, res, next) => {
  const conn = await MongoClient.connect(url);
  const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
  if(req.session.username==undefined)  {res.render('login',{alertmsg: ''});}
  else if (userInfo.role=="manager"){
    console.log(req.body.keyword);
    let srhObj = req.body.keyword;

    //start searching:
    if (await conn.db("systemofschool").collection("student").countDocuments(
      {
        $or:[
          {sname: {$regex: srhObj, $options: 'i'}},
          {dob: {$regex: srhObj.replaceAll("-", "\\-")}},
          {gender: {$regex: srhObj, $options: 'i'}},
          {clid: {$regex: srhObj, $options: 'i'}},
          {sid: {$regex: srhObj}}
        ]
      }) ==0 )
    {
        res.render('deletestudent',{
          errmsg: 'No result found.', 
          list: await conn.db("systemofschool").collection("student").find().project({_id:0}).sort({sid:1}).toArray()}); //{sname: {$regex: req.body.keyword, $option: 'i'}}
    } else 
    {
        res.render(
            'deletestudent',{
              errmsg: '', 
              list: await conn.db("systemofschool").collection("student").find(
              {
                $or:[
                  {sname: {$regex: srhObj, $options: 'i'}},
                  {dob: {$regex: srhObj.replaceAll("-", "\\-"), $options: 'i'}},// '2020'+'\-'+'02'+'\-'+'24' // '2020'+'\-' //{dob: {$text:{$search: srhObj}}},
                  {gender: {$regex: srhObj, $options: 'i'}},
                  {clid: {$regex: srhObj, $options: 'i'}},
                  {sid: {$regex: srhObj}}
                ]
              }).toArray()}
        );
    }
  } else{
    const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
  }
  conn.close();
}); //end searchstudent

module.exports = router;