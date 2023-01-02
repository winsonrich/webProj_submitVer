// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.post('/', async(req, res, next) => {
  console.log(req.body.keyword);
  let srhObj = req.body.keyword;
  const conn = await MongoClient.connect(url);
  if (await conn.db("systemofschool").collection("student").countDocuments(
    {
      $or:[
        {sname: {$regex: srhObj, $options: 'i'}},
        {dob: {$regex: srhObj.replaceAll("-", "\\-"), $options: 'i'}},
        {gender: {$regex: srhObj, $options: 'i'}},
        {clid: {$regex: srhObj, $options: 'i'}},
        {sid: {$regex: srhObj}}
      ]
    }) ==0 ){
      res.send("No result found");
  } else {
      res.render(
          'searchstudentResult',{list: await conn.db("systemofschool").collection("student").find(
            {
              $or:[
                {sname: {$regex: srhObj, $options: 'i'}},
                {dob: {$regex: srhObj.replaceAll("-", "\\-"), $options: 'i'}},
                {gender: {$regex: srhObj, $options: 'i'}},
                {clid: {$regex: srhObj, $options: 'i'}},
                {sid: {$regex: srhObj}}
              ]
            }).toArray()}
      );
      conn.close();
  }
});

module.exports = router;