var express = require('express');
var router = express.Router();
var fs = require("fs");
var formidable = require("formidable");

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongo_url = "mongodb://localhost:27017";

/* GET users listing. */
router.route("/regist")
    .get(function(req, res) {
        res.render('users', { title: 'regist', type: "regist" });
        return;
    })
    .post(function(req, res) {
        var form = new formidable();
        form.uploadDir = "./public/images";
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log(err)
                res.render("error", {
                    message: "form转码失败"
                })
                return
            }
            var username = fields.username;
            var password = fields.password;
            // 如果没上传文件，使用默认头像
            fs.mkdir("public/images/" + username, function(err) {
                if (err) {
                    res.render("err", {
                        msg: "创建用户文件夹出错",
                        error: err
                    })
                    return;
                };
                fs.mkdir("public/images/" + username + "/head_pic", function (err) {
                    if (err) {
                        res.render("err", {
                            msg: "创建头像文件夹出错",
                            error: err
                        })
                        return;
                    };
                    if (files.head_pic.name) {

                        var extend = files.head_pic.name.split(".").pop();
                        var head_pic_url = username + "/head_pic/head_pic." + extend;
                        var oldpath = files.head_pic.path;
                        var newpath = form.uploadDir + "/" + head_pic_url;
                        fs.rename(oldpath, newpath, function(err) {
                            if (err) {
                                res.render("err", {
                                    msg: "重命名出错",
                                    error: err
                                })
                                return
                            };
                            MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
                                if (err) {
                                    console.log(err);
                                    res.render("error", {
                                        message: "连接数据库失败"
                                    })
                                    return
                                }
                                var db = client.db("album");
                                var data = {
                                    "username": username,
                                    "password": password,
                                    "head_pic": "images/" + head_pic_url
                                }
                                db.collection("users").insertOne(data, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.render("error", {
                                            message: "插入数据失败"
                                        })
                                        client.close();
                                        return
                                    }
                                    client.close();
                                    req.session.username = username;
                                    req.session.head_pic = "images/" + head_pic_url;
                                    res.redirect("/");
                                })
                            })
                        })
                    } else {
                        fs.readFile("./public/images/head_pic.jpg", function(err, data) {
                            if (err) {
                                res.render("error", {
                                    message: "读取默认头像失败"
                                })
                                return
                            }
                            fs.appendFile("./public/images/" + username + "/head_pic/head_pic.jpg", data, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.render("error", {
                                        message: "默认头像添加出错"
                                    })
                                    return;
                                };
                                MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
                                    if (err) {
                                        res.render("error", {
                                            message: "默认头像连接数据库出错"
                                        })
                                        return;
                                    }
                                    var db = client.db("album");
                                    var data = {
                                        "username": username,
                                        "password": password,
                                        "head_pic": "images/" + username + "/head_pic/head_pic.jpg"
                                    }
                                    db.collection("users").insertOne(data, function(err, result) {
                                        if (err) {
                                            console.log(err);
                                            res.render("error", {
                                                message: "默认头像插入数据失败"
                                            })
                                            client.close();
                                            return
                                        }
                                        client.close();
                                        req.session.username = username;
                                        req.session.head_pic = "images/" + username + "/head_pic/head_pic.jpg";
                                        res.redirect("/");
                                    });
                                });
                            })
                        })
                    }
                })
            })
        })
    })

router.route("/login")
    .get(function(req, res) {
        res.render("users", {
            title: "login",
            type: "login"
        });
    })
    .post(function(req, res) {
        var query = {
            username: req.body.username,
            password: req.body.password
        }
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
            if (err) {
                res.render("error", {
                    message: "连接数据出错"
                })
                return;
            }
            var db = client.db("album");
            db.collection("users").findOne(query, function(err, result) {
                if (err) {
                    res.render("error", {
                        message: "查询出错"
                    })
                    client.close();
                    return;
                }
                if (result) {
                    req.session.username = result.username;
                    req.session.head_pic = result.head_pic;
                    client.close();
                    res.redirect("/");
                } else {
                    res.render("error", {
                        message: "登陆失败",
                        error: {
                            msg : "用户名与密码不匹配"
                        }
                    })
                    client.close();
                }
            })
        })
    })

router.route("/exit")
.get(function(req, res){
    req.session.username = null;
    res.redirect("/");
})

router.get("/checkname", function(req, res) {
    var username = req.query.username;
    var type = req.query.type;
    MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            res.json({
                error: 1,
                "msg": "数据库连接错误"
            })
            return
        };
        var db = client.db("album");
        db.collection("users").findOne({ username: username }, function(err, result) {
            if (result) {
                if (type === "regist") {
                    res.json({
                        error: 2,
                        "msg": "用户名已被占用，请重新输入"
                    })
                } else if (type === "login") {
                    res.json({
                        error: 0,
                        "msg": "已注册，可以登陆"
                    })
                }
            } else {
                if (type === "regist") {
                    res.json({
                        error: 0,
                        "msg": "未注册，可以使用"
                    })
                } else if (type === "login") {
                    res.json({
                        error: 4,
                        "msg": "未注册，不能登陆"
                    })
                }
            }

        })
    })
})

router.get("/allNames", function (req, res) {
    var username = req.session.username;
    var head_pic = req.session.head_pic;
    if (username) {
        var type = req.query.type;
        MongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, client) {
            if (err) {
                res.json({
                    error: 1,
                    "msg": "数据库连接错误"
                })
                return
            };
            var db = client.db("album");
            db.collection("users").find({}).toArray(function (err, result) {
                if (err) {
                    res.render("err", {
                        msg : "查询出错",
                        err: err
                    })
                }
                var userArr = []
                result.forEach(function (value, index) {
                    userArr.push(value.username)
                })
                res.send({users: userArr})
            })
        })
    }else {
        res.redirect("/users/login");
    }
})
module.exports = router;