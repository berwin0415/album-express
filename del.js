// 引入fs模块
var fs = require("fs");

// 当前模块提供一个功能 将一个目录变成空的 并删除该目录
function del(path) {
	// 读取path目录 获取内部的所有文件和文件夹名称
	var arr = fs.readdirSync(path);
	console.log(arr);
	// 挨个判断里面的每一项是文件还是文件夹
	for(var i = 0; i < arr.length; i++) {
		// 调用stat的同步方法判定文件的状态
		var stat = fs.statSync(path + "/" + arr[i]);
		// 如果是一个文件夹
		if(stat.isDirectory()) {
			del(path + "/" + arr[i]);
		} else {
			// 如果是一个文件
			fs.unlinkSync(path + "/" + arr[i]);
		}
	}
	// 当代码执行到这里 说明该路径下的所有文件和文件夹都已经没有了
	fs.rmdirSync(path);
}



module.exports = del;