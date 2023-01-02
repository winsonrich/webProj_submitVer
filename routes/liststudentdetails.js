// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var express = require('express');
var router = express.Router();

var path = require('path');
// for find ObjectId
const mongo = require('mongodb');
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');

router.get('/:id', async(req, res, next)=>{
    console.log("here", req.params.id);
    const conn = await MongoClient.connect(url);
    res.render('liststudentdetails',{
    list2: await conn.db("systemofschool").collection("student").find({_id:new mongo.ObjectId(req.params.id)}).toArray()
    });
    conn.close();
});
module.exports = router;