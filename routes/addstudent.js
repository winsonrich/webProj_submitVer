// PE076DS-3 Web Application Development Project ; Group mate name list: Lin Hoi Yin (12) , WanCheukLun (02) , Chan Yim Tao (5), Cheng Tak Wai Dawie (3) 
var fs = require('fs');
var express = require('express');
var multer  = require('multer');
var router = express.Router();
var upload = multer({ dest: 'public/images/uploads/' });
var path = require('path');
var validator = require('validator');
var MongoClient= require('mongodb').MongoClient;
var url = require('./urlModule.js');
let maxsid,maxsidNum;

//check the latest sid (Student ID) in DB:
async function gensid(){
  const conn = await MongoClient.connect(url);
  maxsid = await conn.db("systemofschool").collection("student").find().sort({sid:-1}).limit(1).toArray();
  if (maxsid.length>0){
    maxsidNum = Number(maxsid[0].sid);
  }else{maxsidNum = 0;}
  conn.close();
}
gensid();

router.get('/',(req,res)=>{
  if(req.session.username==undefined) {res.render('login', {alertmsg: ''});}
  else {res.render('addstudent',{alertmsg: ''});gensid();}
}).get('/logout',(req,res)=>{
  delete req.session.username;
  res.redirect("/login", {alertmsg: ''});
});

//after upload photo,copy photo to images folder, update the photo name record in DB

router.post('/addNew', upload.single('photo'), async (req, res, next) => {
  // validaton of student name input
  let name = req.body['sname'].trim();
  if( /^[a-zA-Z ]+$/.test(name)==false){//not equal alphabet-> refresh page
    res.render("addstudent",{alertmsg: 'Please enter a name that ONLY with letters!'});
    return;//prevent browser to run the codes below inside the block of '/addNew'
  } 

  gensid();

  const conn = await MongoClient.connect(url);
  // 1. get the document with greatest sid from database
  // 2. add 1
  // 3. copy an object from req.body
  // 4. update your object with value from 2.
  // 5. insert object from 4 to db
  let rb = req.body;
  
  if(req.file!=undefined){
    let origName = req.file.originalname; // 'abc.jpg'
    let uploadName = req.file.filename;//'34u9834ojkldjfjsdlkfb'
    let uploadfolder = "public/images/uploads/";
    let srcpath = req.file.path; //'public/images/uploads/34u9834ojkldjfjsdlkfb'
    let despath = "public/images/";
    let ftype = origName.substring(origName.indexOf("."));
    let outputType=ftype;

    rb.photo = uploadName+outputType;
    // use fs to mv from req.file.path to your path
    await fs.promises.rename(srcpath , uploadfolder + uploadName + outputType);//, function(err){
    // if(err)throw err;
    //srcpath: 'public/images/uploads/34u9834ojkldjfjsdlkfb'
    // src: 'public/images/uploads/34u9834ojkldjfjsdlkfb'
    //uploadfolder:"public/images/uploads/"
    //uploadName: 1d1de955200bf6b7d0e3cff51434bfcb
    //outputType:".png"
    console.log("File renamed. "+uploadfolder + uploadName + outputType);//});
  
    console.log("cpy src:",uploadfolder + uploadName + outputType,"des:",despath + uploadName + outputType);
    await fs.promises.copyFile(uploadfolder + uploadName + outputType , despath + uploadName + outputType);
    console.log("File copied to: " + despath + uploadName + outputType);
  
    console.log("del path:",srcpath + outputType);
    await fs.promises.unlink(srcpath + outputType);//delete file in upload folder after copied to images folder
    console.log("File deleted. ",srcpath + outputType);//});
    /*when delete or update procedure: 
    //remember to remove image name from db and update new img name to db
    //and delete old file from upload and image folder*/
    console.log("rb.photo:",rb.photo);
  }else{rb.photo = "";}
  rb.sid = (maxsidNum+1);
  console.log("rb.sid:",rb.sid);
  console.log(rb);
  await conn.db("systemofschool").collection("student").insertOne(rb);
  res.redirect("/liststudent");
  conn.close();
});

module.exports = router;