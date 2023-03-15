var express = require('express');
var router = express.Router();
var mailer = require('../controllers/mailer')

/* GET users listing. */
router.get('/reset-password/:id',resetPassword)




module.exports = router;
