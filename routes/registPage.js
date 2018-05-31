var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("456")
  res.render('index', { title: 'Regist' });
});

module.exports = router;