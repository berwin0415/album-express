(function() {
    $username = $("#username");
    $password = $("#password");
    $re_password = $("#re_password");
    $btn = $("#btn");

    var username_lock = true;
    var password_lock = true;
    var re_password_lock = true;

    $username.blur(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var username = $username.val();
        $.ajax({
            url: '/checkname',
            type: 'get',
            dataType: 'json',
            data: {
                type: "regist",
                username: username
            },
            success: function(data) {
            	console.log(123)
            }
        });
    


    });
})();