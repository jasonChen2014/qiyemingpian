var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
//var multer = require('multer'); 

//引入路由句柄
var indexRouter = require('./routes/index');//test
var testRouter = require('./routes/add');//test
var commonapiRouter = require('./routes/commonapi');
var qiyemingpianapiRouter = require('./routes/qiyemingpianapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));// for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//console.log('__dirname:'+__dirname);

app.use('/', indexRouter);//test
app.use('/test', testRouter);//test
app.use('/commonapi', commonapiRouter);
app.use('/qiyemingpianapi', qiyemingpianapiRouter);


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
//app.listen(process.env.PORT || 5000);
module.exports = app;
