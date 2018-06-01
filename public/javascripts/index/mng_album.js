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
        e.stopPropagation()
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
        <div class="top clearfix">
            <form class="upload fl">
                <input type="file" id="files"  name=files multiple/>
                <button class="sub" type="button">提交</button>
            </form>
            <p class="err fl"></p>
            <p class="share fr">分享</p>
            <p class="share_confirm fr">确定</p>
        </div>
        <ul class="imgs"></ul>
        `
        var name = $(this).children('.name').html()
        var $sm_window = $(".sm_window");
        $sm_window.html(ts.parseTemplate(template, {}))
        var $sub = $(".sub");
        var $imgs = $(".imgs");

        getImgs($imgs, name)
        $sub.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var formdata = new FormData($(".upload")[0])
            formdata.append("name", name);
            formdata.append("type", "upload");
            $.ajax({
                url: '/api/upload',
                type: 'post',
                dataType: 'json',
                contentType: false,
                processData: false,
                data: formdata,
                success: function(data) {
                    if (data.error) {
                        $(".err").html(data.msg);
                    } else {
                        getImgs($imgs,name)
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
    // get images of albums by send ajax
    function getImgs(obj , name) {
        $.ajax({
            url: '/api/images',
            type: 'get',
            dataType: 'json',
            data: {
                type: 'get_images',
                name: name
            },
            success: function(data) {

                if (data.error) {
                    $(".err").html(data.msg);
                } else {
                    var temp2 = `
                        <% for (var i = 0; i < data.length; i++) { %>
                            <li class="images fl"><img src="<%= data[i] %>" alt="" /></li> 
                        <% } %>
                    `;
                    obj.html(ts.parseTemplate(temp2, data.images));
                }
            }
        })
    }
})()