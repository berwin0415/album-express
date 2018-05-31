var express = require('express');
var router = express.Router();

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongo_url = "mongodb://localhost:27017";


/* GET home page. */
router.get('/', function(req, res, next) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        res.render('index', {
            title: "Album",
            username: username,
            head_pic: head_pic,
            js: "index/index",
            type: "index"
        });
    } else {
        res.redirect("/users/login");
    }
});
// get all_album page
router.get("/all_album", function(req, res, next) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        // define username array
        var users = []
        // connect database
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
            if (err) {
                res.json({
                    error: 1,
                    "msg": "数据库连接错误"
                })
                client.close();
                return
            };
            var db = client.db("album");
            db.collection("users").find({}).toArray(function(err, result) {
                if (err) {
                    res.render("err", {
                        msg: "查询出错",
                        err: err
                    })
                    client.close();
                    return
                }
                client.close();
                // push username to array
                result.forEach(function(value, index) {
                    var coverImg = value.coverImg ? value.coverImg : "folder.jpg";
                    users.push({ username: value.username, coverImg });
                })
                res.render('album', {
                    title: "全部相册",
                    username: username,
                    head_pic: head_pic,
                    type: "all_album",
                    users: users
                });
            })
        })
        // render

    } else {
        res.redirect("/users/login");
    }
})

router.get("/my_album", function(req, res, next) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        res.render('album', {
            title: "Album",
            username: username,
            head_pic: head_pic,
            type: "my_album"
        });
    } else {
        res.redirect("/users/login");
    }
})

router.get("/mng_album", function(req, res, next) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
            if (err) {
                res.render("err", {
                    msg: "连接数据库失败",
                    error: err
                })
                return;
            }
            var db = client.db("album");
            var col_data = db.collection("data");
            var query = { username: username };
            db.collection("data").find(query).toArray(function(err, result) {
                if (err) {
                    res.render("err", {
                        msg: "查询失败",
                        error: err
                    })
                    client.close();
                    return;
                }
                client.close();
                result.forEach(function(value, index) {
                    for (var i = index + 1; i < result.length; i++) {
                        if (result[i].album === value.album) {
                            result.splice(i, 1);
                            i--;
                        }
                    }
                })
                var data = {
                    title: "Album",
                    username: username,
                    head_pic: head_pic,
                    type: "mng_album",
                    albums: result
                }
                console.log(data)
                res.render('album', data);
            })
        })
    } else {
        res.redirect("/users/login");
    }
})

module.exports = router;