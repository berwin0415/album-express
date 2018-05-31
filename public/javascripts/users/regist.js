(function() {
    $username = $("#username");
    $password = $("#password");
    $re_password = $("#re_password");
    $username_tip = $(".username");
    $password_tip = $(".password");
    $re_password_tip = $(".re_password");
    $btn = $("#btn");

    var username_lock = false;
    var password_lock = false;
    var re_password_lock = false;

    $btn.click(function(e) {
        if (username_lock && password_lock && re_password_lock) {

        } else {
            e.preventDefault();
            e.stopPropagation();

        }
    });

    $username.blur(function(e) {
        var username = $username.val();
        // 如果没输入内容处理
        var empty = ts.regStrategy.use("notEmpty", username);
        if (empty) {
            username_lock = false;
            $username.removeClass("success").addClass("error");
            $username_tip.removeClass("success").addClass("error").html(empty);
            return;
        }
        // 输入后处理
        var result = ts.regStrategy.use("username", username);
        // 输入内容符合要求
        if (result === "") {
            $.ajax({
                url: './checkname',
                type: 'get',
                dataType: 'json',
                data: {
                    type: "regist",
                    username: username
                },
                success: function(data) {
                    // 返回错误码2，说明已被注册
                    if (data.error === 2) {
                        console.log(data.msg);
                        username_lock = false;
                        $username.addClass("error")
                        $username_tip.removeClass("success").addClass("error").html("用户名已被占用")
                        return;
                        // 其他非0错误码，输出错误信息
                    } else if (data.error) {
                        username_lock = false;
                        $username.addClass("error")
                        $username_tip.removeClass("success").addClass("error").html(data.msg);
                        return;
                    }
                    // 无错误
                    username_lock = true;
                    $username.removeClass('error');
                    $username_tip.removeClass('error').addClass('success').html("可以注册")
                }
            });
            // 输入内容不符合要求
        } else if (result) {
            username_lock = false;
            $username.addClass("error");
            $username_tip.html(result).removeClass('success').addClass("error");
        }
    });

    $password.blur(function(e) {
        var password = $password.val();
        var result = ts.regStrategy.use("password", password);
        if (result === "") {
            password_lock = true;
            $password.removeClass('error');
            $password_tip.removeClass('error').addClass('success').html("可以使用")

        } else {
            password_lock = false;
            $password.addClass("error");
            $password_tip.removeClass('success').addClass("error").html(result);
        }
    })
    $re_password.blur(function(e) {
        var password = $password.val();
        var re_password = $re_password.val();
        if (password === re_password) {
            re_password_lock = true;
            $re_password.removeClass('error');
            $re_password_tip.removeClass('error').addClass('success').html("")
        } else {
            re_password_lock = false;
            $re_password.addClass("error");
            $re_password_tip.removeClass('success').addClass("error").html("两次密码输入不一致");
        }
    });
    var $regist = $(".regist");
    var $login = $(".login");

    $login.click(function() {
        if (window.location.pathname  === "/users/login") {

        }else {
            window.location.pathname  = "/users/login"
        }
    });
    $regist.click(function() {
        if (window.location.pathname  === "/users/regist") {

        }else {
            window.location.pathname  = "/users/regist"
        };
    });

})();