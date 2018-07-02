var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

//引入路由句柄
var indexRouter = require('./routes/index');//测试接口
var testRouter = require('./routes/add');//测试接口
var commonapiRouter = require('./routes/commonapi');
var qiyemingpianapiRouter = require('./routes/qiyemingpianapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');//jade模板教程：http://www.nooong.com/docs/jade_chinese.htm

app.use(logger('dev'));

//对请求体中数据进行格式化，可以用express自带的中间件，也可以用bodyParser中间件
app.use(express.json());// for parsing application/json
app.use(express.urlencoded({ extended: true }));// for parsing application/x-www-form-urlencoded
//app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//静态文件目录

app.use('/', indexRouter);//test
app.use('/test', testRouter);//test
app.use('/commonapi', commonapiRouter);//公共接口路由
app.use('/qiyemingpianapi', qiyemingpianapiRouter);//企业名片路由


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
