(function () {
	$.ajax({
		url: '/users/allNames',
		type: 'get',
		dataType: 'json',
		data: "",
		success:function (data) {
			console.log(data)
		}
	})
})()