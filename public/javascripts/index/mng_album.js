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
    // edit page
    var $edit = $(".edit");
    var $confirm = $(".confirm");
    var $albums = $(".albums")
    var $close = $('<div class="close">&times;</div>')
    // define edit status lock
    var editLock = false;
    // click edit button
    $edit.click(function(e) {
        if (!editLock) {
            $(".album").append($close).children("img").css("border", "2px solid red");
            $confirm.css("display", "block");
            editLock = true;
        }
    })
    // click confirm button
    $confirm.click(function(e) {
        if (editLock) {
            $(".close").remove()
            $(".album").children("img").css("border", "unset");
            $confirm.css("display", "none");
            editLock = false;
        }
    });
    // add close event for close edit status  on every album
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
                success: function(data) {
                    if (data.error) {
                        console.log(data)
                    } else {
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
    // add album click event ,open small window to manage images
    $albums.on('click', '.album', function(e) {
        $(".mask").css("display", "block");
        $(".sm_window").css("display", "block")
        var template = `
        <form class="upload">
            <input type="text" id="files"  name=files />
            <input type="submit" class="sub" />
        </form>
        <ul class="imgs"></ul>
        `
        var $sm_window = $(".sm_window");
        $sm_window.html(ts.parseTemplate(template, {}))
        var $sub = $(".sub");

        var $imgs = $(".imgs");

        getImgs($imgs)
        $sub.click(function(e) {
            var formdata = new FormData($(".upload"))
            $.ajax({
                url: '/api/upload',
                type: 'post',
                dataType: 'json',
                data: formdata,
                success: function(data) {
                    if (data.error) {

                    } else {
                        getImgs($imgs)
                    }
                }
            })
        });
    });
    // click mask to exit images edit
    $(".mask").click(function(e) {
        $(".mask").css("display", "none");
        $(".sm_window").css("display", "none")
    });

    function getImgs(obj) {
        $.ajax({
            url: '/api/images',
            type: 'get',
            dataType: 'json',
            data: {
                type: 'get_images'
            },
            success: function(data) {

                if (data.error) {
                    obj.html(data.msg)
                } else {

                    var temp2 = `
                        <% for (var i = 0; i < data.images.length; i++) { %>
                            <li><img src="<%= data.images[i] %>" alt="" /></li> 
                        <% } %>
                    `;
                    obj.html(obj.html() + ts.parseTemplate(temp2, data.images));
                }
            }
        })
    }
})()