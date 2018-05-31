var ts = {
    get: function(url, data, callback) {
        let str = "";
        if (typeof data === "string") {
            str += data;
        } else if (typeof data === "object") {
            for (let i in data) {
                str += `${i}=${data[i]}&`;
            }
            str.slice(0, 1);
        }


        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHttp");
        } else {
            console.log("您的浏览器版本过低，请升级");
            return;
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var json = JSON.parse(xhr.responseText)
                callback(json);
            }
        }
        xhr.open("get", `${url}?${str}`, true);

        xhr.send();
    },
    post: function(url, data, callback) {
        let str = "";
        if (typeof data === "string") {
            str += data;
        } else if (typeof data === "object") {
            for (let i in data) {
                str += `${i}=${data[i]}&`;
            }
            str.slice(0, 1);
        }


        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHttp");
        } else {
            console.log("您的浏览器版本过低，请升级");
            return;
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                callback(xhr.responseText);
            }
        }
        xhr.open("post", url, true);

        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded")

        xhr.send(str);
    },
    // 模板格式化函数
    /*
     *@template 模板字符串
     *@data 传入的数据对象
     */
    // format: function(template, data) {
    //     let reg = /<%([a-zA-Z0-9_\.]+)%>/g;
    //     template = template.replace(reg, function(match, $1) {
    //         var arr = $1.split(".");
    //         var obj = data;
    //         for (var i = 0; i < arr.length - 1; i++) {
    //             if (typeof obj[arr[i]] === "object" && obj[arr[i]] != null) {
    //                 obj = obj[arr[i]];
    //             } else {
    //                 return "";
    //             }
    //         }
    //         return obj[arr[i]];
    //     })
    //     // console.log(template)
    //     return template;
    // },
    format: function(template) {
        // <%%>匹配js代码
        const evalReg = /<%(.+?)%>/g;
        //<%=%>匹配js表达式
        const reg = /<%=(.+?)%>/g;
        
        template = template.replace(reg, '`); \n echo( $1 ); \n echo(`')
                            .replace(evalReg, '`); $1 echo(`');
        template = 'echo(`' + template + '`);';

        let script =
         `(function parse (data) {
            let output = "";
             function echo (html) {
                output += html
             }
             ${template}
             //console.log(output);
             return output;
        })`;
        return script
    },
    parseTemplate: function (template, data) {
        let parse = eval(ts.format(template));
        return parse(data);
    },
    /*
     *JSONP跨域方法
     *@url  发送JSONP的地址 ex: http://localhost:3000/
     *@data 发送的数据
     *@callback 回调函数
     */
    JSONP: function(url, data, callback) {
        // 将callback暴露到全局
        window[data.callbackName] = callback;
        // 将data拼接到url上
        let str = "";
        for (var i in data) {
            str += `${i}=${data[i]}&`
        }
        str = str.slice(0, -1)
        // 创建script标签
        let script = document.createElement("script");
        // 设置script标签的请求url
        script.src = `${url}?${str}`;
        // script加载结束后删除暴露到全局的callback
        script.onload = function() {
            delete window[data.callbackName];
            // 下树
            document.body.removeChild(script);
        }
        // 上树，解析代码
        document.body.appendChild(script);
    },
    // 节流器
    throttle: function(fun, options) {
        // 适配options 如果用户没有传递 我们需要定义一个默认值 也就是参数适配
        var options = options || { context: null, args: [], time: 200 };
        // 通过参数判断的方式 实现函数的重载
        if (typeof fun === "function") {
            // 先关延时器
            ts.throttle(false, fun);
            // 说明要设置延时器  给fun函数添加一个自定义属性 该属性可以被函数保存，可以通过函数访问。
            fun._throttle = setTimeout(function() {
                // 执行函数 并且改变this指向 并且传递所需参数
                fun.apply(options.context, options.args);
            }, options.time);
        } else {
            clearTimeout(options._throttle);
        }
    },
    // 用户名密码验证策略
    regStrategy: (function () {
        var _S = {
            notEmpty: function (str) {
                var reg = /^\s*$/;
                return reg.test(str) ? "请输入非空字符串" : null
            },
            number: function (str) {
                var reg = /^[0-9]{11,13}$/
                return reg.test(str) ? "" : "请输入11-13位数字"
            },
            username: function (str) {
                var reg = /^\w{2,14}$/
                return reg.test(str) ? "" : "请输入2-14位英文、数字或者下划线组成的字符"
            },
            password: function (str) {
                var reg = /^.{6,16}$/
                return reg.test(str) ? "" : "请输入6-16位密码"
            }
        };
        return {
            use : function (type, str) {
                return _S[type](str);
            }
        }
    })()
}