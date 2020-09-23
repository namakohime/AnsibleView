var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var i18n = require("i18n");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie:{
  httpOnly: true,
  secure: false,
  maxage: 1000 * 60 * 30
  }
})); 

i18n.configure({
  locales:['ja', 'en'],  //使用する言語指定
  defaultLocale: 'ja',  //デフォルトの言語を決める
  directory: __dirname + '/locales',  //言語の内容を置く場所
  queryParameter: 'lang',  //langクエリで切り替え
  logDebugFn: function (msg) { //デバッグモード
    console.log('debug', msg);
  },
  logWarnFn: function (msg) {  //Warningモード
    console.log('warn', msg);
  },
  logErrorFn: function (msg) { //Errorモード
    console.log('error', msg);
  }
});
app.use(i18n.init);

app.use('/', indexRouter);

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
