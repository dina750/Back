const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const uuid = require('uuid');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig');
require("dotenv").config()
const http=require("http");
const mongoose=require("mongoose");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();
const db= new JsonDB(new Config('myDatabase', true, false, '/'));
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
const server = http.createServer(app);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
   res.json(err.message);
});
app.use(bodyParser.urlencoded({ extended: false }));

// configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

// endpoint for sending verification code to user's email address
app.post('/signup', (req, res) => {
  // generate a verification code
  const code = uuid.v4();

  // save the code, email address, and timestamp in a database
  // ...

  // send an email to the user's email address with the verification code
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: req.body.email,
    subject: 'Verify your email address',
    text: `Your verification code is: ${code}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending verification email');
    } else {
      console.log('Verification email sent: ' + info.response);
      res.send('Verification email sent');
    }
  });
});

// endpoint for verifying email address with code
app.post('/verify', (req, res) => {
  // look up verification code in the database
  // ...

  // check that the code matches the email address and has not expired
  if (verificationCode && verificationCode.email === req.body.email &&
      verificationCode.code === req.body.code &&
      (new Date() - verificationCode.timestamp) < (60 * 60 * 1000)) {
    // mark email address as verified in the database
    // ...
    res.send('Email address verified');
  } else {
    res.status(400).send('Invalid verification code');
  }
});

server.listen(process.env.PORT,()=>{
  console.log(`app is running on port 5000`);
})
//  2 FACTOR AUTHENTIFICATION / USING TOTP (Timebased One Time Password) / CREATING TEMP SCRET
// Generate a secret key
const secret = speakeasy.generateSecret({ length: 20 });

// Generate a QR code URL for the secret key (to be displayed to the user)
QRCode.toDataURL(secret.otpauth_url, function(err, imageUrl) {
  console.log(imageUrl);
});
// Verify a TOTP code
const token = '123456'; // user.get(secretcode)
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: token
});
console.log(verified);

module.exports = app;
