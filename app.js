var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

//login and logout page handling using session:
//create session
var session = require('express-session');
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));
app.use('/login', require('./routes/login'));
app.use('/checklogin', require('./routes/checklogin'));
app.use('/menu', require('./routes/menu'));
app.use('/addstudent', require('./routes/addstudent'));
app.use('/liststudent', require('./routes/liststudent'));
app.use('/liststudentdetails', require('./routes/liststudentdetails'));
app.use('/deletestudent', require('./routes/deletestudent'));
app.use('/updatestudent', require('./routes/updatestudent'));
app.use('/updatestudentdetails', require('./routes/updatestudentdetails'));
app.use('/searchstudent', require('./routes/searchstudent'));
app.use('/searchstudent2', require('./routes/searchstudent2'));
app.use('/searchstudentResult', require('./routes/searchstudentResult'));
app.use('/addacc', require('./routes/addacc'));
app.use('/delacc', require('./routes/delacc'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;