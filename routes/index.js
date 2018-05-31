var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Album' });
});
router.get('/registPage', function(req, res, next) {
    res.render('regist', { title: 'Album' });
});
router.get('/checkname', function(req, res, next) {
	res.send(req.query)
});


module.exports = router;