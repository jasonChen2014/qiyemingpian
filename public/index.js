$(function(){
	var openid = 62368648837;
	//commonapi.login
	$('.btnSubmit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var openid = parseInt(Math.random()*10000000);
		var postData = {
			nickname : $('.nickname').val(),
			avatarUrl : $('.avatarUrl').val(),
			country : $('.country').val(),
			province : $('.province').val(),
			city : $('.city').val(),
			gender : $('.gender').val(),
			appnum : 1,
			openid : openid
		};
		$.ajax({
			url: '/commonapi/login',
			type: 'post',
			dataType: 'json',
			data: postData,
			//contentType 
		})
		.done(function(res) {
			if(!res.err) {
				$('.resultPanel').append('insert success,new record id is:'+res.id+',openid:'+openid+'</br>');
				$('.btnResearch,.btnSubmit2').attr('data-openid', openid);
			}else{
				$('.resultPanel').append('insert fail,'+res.msg+'</br>');
			}
		});
	});
	//commonapi.user_info
	$('.btnResearch').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var openid = $(this).attr('data-openid');
		$.ajax({
			url: '/commonapi/user_info',
			type: 'post',
			dataType: 'json',
			data: {
				openid:openid
			},
			//contentType 
		})
		.done(function(res) {
			if(!res.err) {
				$('.resultPanel').append('research success,record is:<p>'+JSON.stringify(res.data)+'</p>');
			}else{
				$('.resultPanel').append('research fail,'+res.msg+'</br>');
			}
		});
	});
	//commonapi.suggestion
	$('.btnSubmit2').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var suggestion = $('.suggestion').val();
		var openid = $(this).attr('data-openid');
		$.ajax({
			url: '/commonapi/suggestion',
			type: 'post',
			dataType: 'json',
			data: {
				openid:openid,
				suggestion:suggestion,
				appnum:0
			},
			//contentType 
		})
		.done(function(res) {
			if(!res.err) {
				$('.resultPanel2').append('insert suggestion success,new record is:'+res.id+'</br>');
			}else{
				$('.resultPanel2').append('insert fail,'+res.msg+'</br>');
			}
		});
	});
	//qiyemingpianapi.qiyemingpian_save
	$('.btnSubmit3').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid,
			logo : '123124',
			name : '广州市会编科技',
			location : '广州天河区',
			type : 'IT互联网',
			time : '2017-05-18',
			imgs : ['1111','2222','3333'],
			adminname : '陈浩鑫',
			adminmobile : '18878675646',
			adminwechat : 'jiushishuai2018',
			adminqq : '522180441',
			adminemail : '522180441@qq.com',
			description : '一家很牛逼的公司'
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_save',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_detail
	$('.btnSubmit4').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid,
			id : 1
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_detail',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_mycreate
	$('.btnSubmit5').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_mycreate',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_favorite
	$('.btnSubmit6').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid,
			id : 1,
			type : 1
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_favorite',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_favoritelist
	$('.btnSubmit7').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_favoritelist',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_list
	$('.btnSubmit8').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_list',
			type: 'get',
			dataType: 'json',
		})
		.done(function(res) {
			console.log(res);
		});
	});
	//qiyemingpianapi.qiyemingpian_read
	$('.btnSubmit9').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		var data = {
			openid : openid,
			id : 1
		};
		$.ajax({
			url: '/qiyemingpianapi/qiyemingpian_read',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(res) {
			console.log(res);
		});
	});
});