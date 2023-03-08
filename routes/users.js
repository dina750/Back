var express = require('express');
var router = express.Router();
var mailer = require('../controllers/mailer')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/getConfirmationEmail',async function(req, res, next) {
  mailer.sendConfirmationEmail('reusamine0@gmail.com',123456);
})

module.exports = router;
