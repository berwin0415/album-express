(function() {
    var $create_album = $("#create_album");
    var $create = $("#create")
    var $tips = $(".tips")

    var editLock = false;


    $create.click(function(e) {
        if (!editLock) {
            var name = $create_album.val();
            var result = ts.regStrategy.use("username", name);
            var $album_names = $(".albums .name");

            $.each($album_names, function(index, el) {
                if (name == el.innerHTML) {
                    $tips.html("相册已存在");
                    return;
                }
            });
            if (result === "") {
                $tips.html("");
                $.ajax({
                    url: "/api/album",
                    type: "get",
                    dataType: "json",
                    data: {
                        type: 'create',
                        name: name
                    },
                    success: function(data) {
                        if (data.error) {
                            console.log(data.msg)
                            $tips.html(data.msg)
                        } else {
                            $(".albums").append(`<div class="album fl">
                                        <div class="cover">
                                            <img src="/images/folder.jpg" alt="">
                                        </div>
                                        <div class="name">${name}</div>
                                    </div>`)
                        }
                    }
                })
            } else {
                $tips.html(result);
            }
        }
    });

    var $edit = $(".edit");
    var $confirm = $(".confirm");

    var $close = $('<div class="close">&times;</div>')
    $edit.click(function(e) {
        if (!editLock) {
            $(".album").append($close).children("img").css("border", "2px solid red");
            $confirm.css("display", "block");
            editLock = true;
        }
    })
    $confirm.click(function(e) {
        if (editLock) {
            $(".close").remove()
            $(".album").children("img").css("border", "unset");
            $confirm.css("display", "none");
            editLock = false;
        }
    });
    var $albums = $(".albums")
    $albums.on("click", ".close", function(e) {
    	e.preventDefault()
        if (editLock) {
            var name = $(this).siblings(".name").html();
            var me = this;
            $.ajax({
            	url: '/api/album',
            	type: 'get',
            	dataType: 'json',
            	data: {
            		type: 'delete',
            		name: name
            	},
            	success: function (data) {
            		if (data.error) {
            			console.log(data)
            		}else {
            			$(me).parent().remove()
            		}
            	}
            })
        } else {
            $(".close").remove()
            $(".album").children("img").css("border", "unset");
            $confirm.css("display", "none");
        }
    })
    $albums.on('click', '.album', function(e) {
    	$(".mask").css("display", "block");
    	$(".sm_window").css("display", "block")
    });

    $(".mask").click(function(e) {
    	$(".mask").css("display", "none");
    	$(".sm_window").css("display", "none")
    });
})()