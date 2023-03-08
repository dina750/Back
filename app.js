var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');




require("dotenv").config()
const http=require("http");
const mongoose=require("mongoose");


//ROUTES
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

//MONGOOSE
mongoose.set('strictQuery',true)
mongoose.connect("mongodb://localhost:27017/Efarm",{UserNewUrlParser: true})
.then(()=>{console.log("connected to DB")})
.catch((err)=>{console.log(err.message)});


// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  res.json(err.message);
});
console.log(process.env.PORT)
const server=http.createServer(app);

server.listen(process.env.PORT,()=>{
  console.log(`app is running on port 5000`);
})
// //  2 FACTOR AUTHENTIFICATION / USING TOTP (Timebased One Time Password) / CREATING TEMP SCRET
// // Generate a secret key
// const secret = speakeasy.generateSecret({ length: 20 });
// // Generate a QR code URL for the secret key (to be displayed to the user)
// QRCode.toDataURL(secret.otpauth_url, function(err, imageUrl) {
//   console.log(imageUrl);
// });
// // Verify a TOTP code
// const token = req.body.token; // user.get(secretcode)
// const verified = speakeasy.totp.verify({
//   secret: secret.base32,
//   encoding: 'base32',
//   token: token
// });
// console.log(JSON.stringify(verified));





module.exports = app;
