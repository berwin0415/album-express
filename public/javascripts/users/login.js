(function() {


    $username = $("#username");
    $password = $("#password");
    $username_tip = $(".username");
    $password_tip = $(".password");
    $btn = $("#btn");

    var username_lock = false;
    var password_lock = false;

    $btn.click(function(e) {
        if (username_lock && password_lock) {

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
            // 无错误
            username_lock = true;
            $username.removeClass("error");
            $username_tip.html(result).removeClass('error').addClass("success");
        }
        // 输入内容不符合要求
        else if (result) {
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
            $password_tip.removeClass('error').addClass('success')

        } else {
            password_lock = false;
            $password.addClass("error");
            $password_tip.removeClass('success').addClass("error").html(result);
        }
    })

    var $box = $(".box")
    var $regist = $(".regist");
    var $login = $(".login");

    $login.click(function() {
        if (window.location.pathname === "/users/login") {

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