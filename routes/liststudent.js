// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');
router.get('/', async(req, res, next)=>{
  const conn = await MongoClient.connect(url);
  res.render('liststudent',{
    list: await conn.db("systemofschool").collection("student").find().sort({sid:1}).toArray(), errmsg: ''
  });
  conn.close();
});

router.post('/searchstudent', async(req, res, next) => {
  console.log(req.body.keyword);
  let srhObj = req.body.keyword;
  const conn = await MongoClient.connect(url);
  
  if (await conn.db("systemofschool").collection("student").countDocuments(
    {
      $or:[
        {sname: {$regex: srhObj, $options: 'i'}},
        {dob: {$regex: srhObj.replaceAll("-", "\\-")}},
        {gender: {$regex: srhObj, $options: 'i'}},
        {clid: {$regex: srhObj, $options: 'i'}},
        {sid: {$regex: srhObj}}
      ]
    }) ==0 ){
      res.render('liststudent',{list: await conn.db("systemofschool").collection("student").find().project({_id:0}).sort({sid:1}).toArray(), errmsg: 'No result found.'}); //{sname: {$regex: req.body.keyword, $option: 'i'}}
  } else {
      res.render(
          'liststudent',{list: await conn.db("systemofschool").collection("student").find(
            {
              $or:[
                {sname: {$regex: srhObj, $options: 'i'}},
                {dob: {$regex: srhObj.replaceAll("-", "\\-"), $options: 'i'}},
                {gender: {$regex: srhObj, $options: 'i'}},
                {clid: {$regex: srhObj, $options: 'i'}},
                {sid: {$regex: srhObj}}
              ]
            }).toArray(), errmsg: ''}
      );
      conn.close();
  }
});

module.exports = router;