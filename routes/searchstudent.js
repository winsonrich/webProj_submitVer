const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  if(req.session.username==undefined) {res.render('login');}
  else {res.render('searchstudent',{alertmsg: ''});}  //render search student page
}).get('/logout',(req,res)=>{  
  delete req.session.username;
  res.redirect("/login");
});


module.exports = router;
