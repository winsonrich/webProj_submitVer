// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
const fs = require('fs');
const express = require('express');
const multer  = require('multer');
const router = express.Router();
const upload = multer({ dest: 'public/images/uploads/' });
const { ObjectId } = require('mongodb');
const path = require('path');
const MongoClient= require('mongodb').MongoClient;
const mongo = require('mongodb');
const url = require('./urlModule.js');
let stdtIDinfo = "";//an obj record and related information search by student's unique _id in DB
let obj;
const imgpath = "public/images/";
// security: authentication, check user login session, render updatestudent template:
router.get('/', async(req, res, next)=>{
  const conn = await MongoClient.connect(url);
  const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
  if(req.session.username==undefined)  {res.render('login');}
  else if (userInfo.role=="manager"){
    res.render('updatestudent',{
    list: await conn.db("systemofschool").collection("student").find().sort({sid:1}).toArray()
    });
  } else{
    const userInfo = await conn.db("systemofschool").collection("login").findOne({"liname":req.session.username});
    res.render('menu', { login_name: userInfo.liname, role: userInfo.role });
  }
  conn.close();
});

//get update id from html form: 
router.get('/:id', async(req, res, next)=>{
  console.log("update id's param value: ", req.params.id);
  const conn = await MongoClient.connect(url);
  obj = { _id: ObjectId(req.params.id)};
  stdtIDinfo = await conn.db("systemofschool").collection("student").find(obj).toArray();//tested OK
  res.render('updatestudentdetails',{
  list2: stdtIDinfo
  });
  conn.close();
});

//update student info:
router.post('/edit', upload.single('photo'), async(req, res, next)=>{
  // validaton of student name input
  // get existing info in DB -> compare with new value in form -> update to student record in DB
  
  const conn = await MongoClient.connect(url);
  let oldstdtIDinfo = stdtIDinfo[0] , newstdtIDinfo = req.body;
  console.log("oldstdtIDinfo",oldstdtIDinfo);
  console.log("newstdtIDinfo",newstdtIDinfo);
  //oldphoto="" in DB record, a file req has a new upload photo:
  if( (oldstdtIDinfo.photo==null || oldstdtIDinfo.photo=="") && req.file != undefined){//&& newstdtIDinfo.photoName!=undefined){
    console.log("oldphoto=empty str in DB record, a file req has a new upload photo");
    console.log("oldstdtIDinfo.photo:",oldstdtIDinfo.photo,"req.file.originalnam",req.file.originalname,"rs",oldstdtIDinfo.photo!=req.file.originalname);

    console.log("origName", req.file.originalname,"uploadName",req.file.filename);//debug multer

    //init photo access
    let origName = req.file.originalname; // 'abc.jpg'
    let uploadName = req.file.filename;//'34u9834ojkldjfjsdlkfb'
    let uploadfolder = "public/images/uploads/";
    let srcpath = req.file.path; //'public/images/uploads/34u9834ojkldjfjsdlkfb'
    let despath = "public/images/";
    let ftype = origName.substring(origName.indexOf("."));
    let outputType = ftype;
    let oldphoto = oldstdtIDinfo.photo; //34u9834ojkldjfjsdlkfb.jpg    

    await fs.promises.rename(srcpath , srcpath + outputType);
    console.log("File renamed. "+srcpath + outputType);
  
    console.log("cpy src:",srcpath + outputType,"des:",despath + uploadName + outputType);
    await fs.promises.copyFile(srcpath + outputType , despath + uploadName + outputType);
    console.log("File copied to: " + despath + uploadName + outputType);
  
    newstdtIDinfo.photo = uploadName+outputType;
    console.log("newstdtIDinfo.photo:",newstdtIDinfo.photo);
    console.log(newstdtIDinfo);

    console.log("del file from upload folder:",srcpath + outputType);
    await fs.promises.unlink(srcpath + outputType);
    console.log("File deleted. ",despath + oldphoto);
  }
  
  //if the old photo is not empty str, old photo name exists in DB record, old name diff with new name, a file req has a upload photo
  else if(oldstdtIDinfo.photo != newstdtIDinfo.photoName && req.file != undefined){//&& newstdtIDinfo.photoName!=undefined){
    console.log("old photo is not empty str, old photo name exists in DB record, old name diff with new name, a file req has a upload photo");

    console.log("oldstdtIDinfo.photo:",oldstdtIDinfo.photo,"req.file.originalnam",req.file.originalname,"rs",oldstdtIDinfo.photo!=req.file.originalname);

    console.log("origName", req.file.originalname,"uploadName",req.file.filename);//debug multer

    //init photo access
    let origName = req.file.originalname; // 'abc.jpg'
    let uploadName = req.file.filename;//'34u9834ojkldjfjsdlkfb'
    let uploadfolder = "public/images/uploads/";
    let srcpath = req.file.path; //'public/images/uploads/34u9834ojkldjfjsdlkfb'
    let despath = "public/images/";
    let ftype = origName.substring(origName.indexOf("."));
    let outputType = ftype;
    let oldphoto = oldstdtIDinfo.photo; //34u9834ojkldjfjsdlkfb.jpg    

    await fs.promises.rename(srcpath , srcpath + outputType);
    console.log("File renamed. "+srcpath + outputType);
  
    console.log("cpy src:",srcpath + outputType,"des:",despath + uploadName + outputType);
    await fs.promises.copyFile(srcpath + outputType , despath + uploadName + outputType);
    console.log("File copied to: " + despath + uploadName + outputType);
  
    newstdtIDinfo.photo = uploadName+outputType;
    console.log("newstdtIDinfo.photo:",newstdtIDinfo.photo);
    console.log(newstdtIDinfo);

    // delete old photo from existing "upload" folder
    //get _id in db as an obj data type, it contains infos of that record from selected itemId in html form table
    if(oldphoto!=""&&oldphoto!=undefined){
      console.log("del old file from images:",despath + oldphoto);
      await fs.promises.unlink(despath + oldphoto);
      console.log("1 old photo deleted.");
    }
    console.log("del file from upload folder:",srcpath + outputType);
    await fs.promises.unlink(srcpath + outputType);
    console.log("File deleted. ",despath + oldphoto);
  }
  
  //update records to DB:
  let fields = ["sname", "dob", "gender", "clid"];
  console.log("fields:",fields);

  // combine and aggregate all field names from oldstdtIDinfo and newstdtIDinfo
  let genChangeDynamicFields=(oldstdtIDinfo, newstdtIDinfo)=>{
    let oldfieldsarr = Object.keys(oldstdtIDinfo); // ["aaa", "bbb"]
    let newfieldsarr = Object.keys(newstdtIDinfo);
    let resultStdtIDinfo={};
    for (let o of oldfieldsarr){ // for "in": object, for "of": array
      resultStdtIDinfo[o]=oldstdtIDinfo[o];//add old fields as a base to result field object
      for (let n of newfieldsarr){ // for "in": object, for "of": array
        if( !o.includes(n) ){//found a new field name in newfieldsarr
          resultStdtIDinfo[n]=newstdtIDinfo[n];//add to result field name
        }
      }
    }// result field object is built, contains both fields(key/value) of oldstdtIDinfo obj and newstdtIDinfo obj
    return resultStdtIDinfo;
  }
  console.log("genChangeDynamicFields:", genChangeDynamicFields(oldstdtIDinfo , newstdtIDinfo) );

  // filter result: filterDynamicFieldsResult( genChangeDynamicFields here , field name to be filter for further use: ["sname", "dob", "gender", "clid"] )
  let filterDynamicFieldsResult=(resultStdtIDinfo, fieldNameStrArr)=>{
    let filteredresult={};
    for (let x of fieldNameStrArr){//let fields2 = ["sname", "dob", "gender", "clid"]; 
      filteredresult[x]=resultStdtIDinfo[x];
      console.log("filteredresult["+x+"]: "+filteredresult[x]+" updated");
    }
    if(resultStdtIDinfo["photo"] != undefined){
      filteredresult["photo"]=resultStdtIDinfo["photo"];
      console.log("filteredresult[\"photo\"]: "+filteredresult["photo"]+" updated");
    }
    return filteredresult;
  };
  //refine the result for update use: to be continue:
  let fields2 = ["sname", "dob", "gender", "clid"]; 
  let refineResult = filterDynamicFieldsResult( genChangeDynamicFields(oldstdtIDinfo , newstdtIDinfo) , fields2 )
  console.log("refineResult:", refineResult );

  console.log("Start insert records into db");
  await conn.db("systemofschool").collection("student").updateOne(
    {_id : oldstdtIDinfo._id},
    {$set: refineResult}
  ); 
  //end update records to DB

  conn.close();
  res.redirect("/updatestudent");
});//end of : router.post('/edit', upload.single('photo'), async(req, res, next)=>{

module.exports = router;
