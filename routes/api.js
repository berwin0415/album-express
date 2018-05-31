var express = require('express');
var router = express.Router();
var fs = require("fs");
var del = require("../del.js");

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongo_url = "mongodb://localhost:27017";


/* GET home page. */
router.get('/album', function(req, res, next) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        var type = req.query.type;
        var name = req.query.name;
        // create album
        if (type === "create") {
            var album_path = "./public/images/" + username + "/" + name
            fs.mkdir(album_path, function(err) {
                if (err) {
                    res.json({
                        error: 1,
                        msg: "创建相册失败"
                    })
                    return;
                }
                MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
                    if (err) {
                        res.json({
                            error: 2,
                            msg: "数据库连接失败"
                        });
                        return;
                    }
                    var db = client.db("album");
                    var col_data = db.collection("data")
                    var data = {
                        username: username,
                        album: name,
                        cover_img: "images/folder.jpg"
                    }
                    col_data.insertOne(data, function(err) {
                        if (err) {
                            res.json({
                                error: 3,
                                msg: "数据库写入失败"
                            })
                            client.close();
                            return
                        }
                        client.close();
                        res.json({
                            error: 0,
                            msg: "创建成功"
                        })
                    })
                })
            })
            // delete album
        } else if (type === "delete") {
            var del_path = "./public/images/" + username + "/" + name;
            try {
                del(del_path);
                MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
                    if (err) {
                        res.json({
                            error: 2,
                            msg: "数据库连接失败"
                        });
                        return;
                    }
                    var db = client.db("album");
                    var col_data = db.collection("data")
                    var data = {
                        username: username,
                        album: name,
                    }
                    col_data.deleteOne(data, function(err) {
                        if (err) {
                            res.json({
                                error: 3,
                                msg: "数据库删除失败"
                            })
                            client.close();
                            return
                        }
                        client.close();
                        res.json({
                            error: 0,
                            msg: "相册删除成功"
                        })
                    })
                })
            } catch (e) {
                res.json({
                    error: 1,
                    msg: "相册删除失败",
                    err: e
                })
            }
        }
    } else {
        res.redirect("/users/login");
    }
});

router.get("/images", function (req, res)   {
    var username = req.session.username;
    var name = req.query.name;
    var type = req.query.type;
    // open album
    if (type === "open") {
        // find name album in db
        MongoClient.connect(mongo_url, {useNewUrlParser: true}, function (err, client) {
            if (err) {
                res.json({
                    error: 2,
                    msg: "数据库连接失败"
                })
                return
            }
            var db = client.db("album");
            var col_data = db.collection("data");
            var query = {
                username: username,
                album: name
            }
            col_data.find(query).toArray(function (err, result) {
                if (err) {
                    res.json({
                        error: 3,
                        msg:"数据库查询失败",
                    })
                    client.close();
                    return
                }
                client.close();
                var images = []
                result.forEach(function (value, index) {
                    if (value.iamge) {
                        images.push(value.iamge)
                    }
                })
                res.json({
                    error: 0,
                    images: images
                })
            })
        })

    }
})

module.exports = router;