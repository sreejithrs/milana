var createError = require('http-errors');
var express = require('express');
var path = require('path');
var hbs=require('express-handlebars')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')
var fileUpload=require('express-fileupload')
var db=require('./config/connection')
const MongoStore = require('connect-mongo');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/',
helpers:{eq: function(arg1, arg2) {
  return (arg1 == arg2) ? true : false; 
}}
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'Key',cookie:{maxAge:3000000},saveUninitialized: false,resave: false}))
// app.use(session({
//   secret: 'key',
//   store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/milana' }),
//   saveUninitialized: false, 
//   resave: false
// }));
app.use(fileUpload())




db.connect((err)=>{
  if(err){
    console.log("Database Connection Error"+err);
  }
  else{
    console.log("Database Connected Successfully");
  }
})


app.use('/admin', adminRouter);
app.use('/', usersRouter);

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
