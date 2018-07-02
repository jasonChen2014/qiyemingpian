var express = require('express');
var router = express.Router();
var URL = require('url');
var path = require('path');
var superagent = require('superagent');//调用远程接口
var fs = require("fs");//操作文件
var multer  = require('multer');//文件上传中间件
var upload = multer({ dest: './public/upload/images'});//定义图片上传的临时目录
var eventproxy = require('eventproxy');//异步控制-eventproxy
//加载mysql模块
var mysql = require('mysql');
//创建连接
//终于连上去了，想哭。。。
var connection = mysql.createConnection('mysql://*********:*********@o677vxfi8ok6exrd.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/nxnbkp5g4lsyl88q');
// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : '*********',
//     password : '*********',
//     database : 'qiyemingpian'
// });
//执行创建连接 
connection.connect();
//SQL语句
var  sql = 'SELECT * FROM ppx_huibian_user';
var  qiyemingpian_list_sql = 'SELECT * FROM ppx_huibian_companycard';
var qiyemingpian_save_sql = 'INSERT INTO ppx_huibian_companycard(user_id,logo,name,location,type,time,description,create_time,info) VALUES(?,?,?,?,?,?,?,?,?)';
var qiyemingpian_img_save = 'INSERT INTO ppx_huibian_companycard_img(company_id,img) VALUES';
var qiyemingpian_detail_sql = 'SELECT * FROM ppx_huibian_companycard';

/*
** openid 换取 user_id
*/
function exchangeForUserId(openid){
	return new Promise(function(resolve,reject){
		//根据openid查询
		var innersql = sql + ' where openid="' + openid + '"';
		connection.query(innersql,function (err, result) {
			if(err || result.length == 0){
				console.log('[SELECT ERROR] - ',err.message);
				reject({err:true});
				return;
			}
			resolve({user_id:result[0].id});
		});
	});
}

//获取openid
router.get('/get_openid',function(req, res, next) {
	var params = req.query;
	if(Object.keys(params).length == 0){
		res.json({err:true,msg:'empty params'});
		return;
	}
	var code = params.code;
	if(!code) {
		res.json({err:true,msg:'empty code'});
		return;
	}
    //常量可以使用一个模块统一管理
    var appid = '********';
    var secret = '********';
    var wx_url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+code+'&grant_type=authorization_code';
    superagent.get(wx_url).end(function(err,sres){
    	if(err) {
    		res.json({err:true,msg:'get openid fail'});
    		return next(err);
    	}
    	res.json({err:false,msg:'success',data:res});
    });
});
//企业名片创建
router.post('/qiyemingpian_save', function(req, res, next) {
    //解析请求参数
    //var params = URL.parse(req.url, true).query;
    var params = req.body;
    if(!params){
    	res.json({err:true,msg:'empty params'});
    	return;
    }
    if(!params.openid){
    	res.json({err:true,msg:'empty openid'});
    	return;
    }
    if(!params.logo){
    	res.json({err:true,msg:'empty logo'});
    	return;
    }
    if(!params.name){
    	res.json({err:true,msg:'empty name'});
    	return;
    }
    if(!params.location){
    	res.json({err:true,msg:'empty location'});
    	return;
    }
    if(!params.type){
    	res.json({err:true,msg:'empty type'});
    	return;
    }
    if(!params.time){
    	res.json({err:true,msg:'empty time'});
    	return;
    }
    console.log(params.imgs.length);
    if(params.imgs.length < 1){
    	res.json({err:true,msg:'empty imgs'});
    	return;
    }
    //info字段
    var info = JSON.stringify({adminname:params.adminname,adminmobile:params.adminmobile,adminwechat:params.adminwechat,adminqq:params.adminqq,adminemail:params.adminemail});
    //数据库缺乏管理员表
    exchangeForUserId(params.openid).then(function(data){
    	var user_id = data.user_id;
    	var addSqlParams = [user_id, params.logo, params.name, params.location,params.type, params.time, params.description, (new Date()).toLocaleDateString(),info];
    	//存储名片基本信息
    	connection.query(qiyemingpian_save_sql,addSqlParams,function (err, result) {
    		if(err){
    			console.log('[INSERT ERROR] - ',err.message);
    			res.json({err:true,msg:'insert fail'});
    			return;
    		}
    		//存储名片图片
    		//这里需要批量插入图片记录，想到的方法有两种：
    		//1、使用async模块、promise、eventproxy等异步控制方法
    		//2、insert语句插入多条记录写法
    		//这里使用第二种方法，也就是类似于：
    		// INSERT INTO ppx_huibian_suggesstion(user_id,suggesstion,appnum) VALUES(791,'haha',1),(791,'hehe',1);
    		var inner_qiyemingpian_img_save = qiyemingpian_img_save;
    		var imgs = params.imgs;
    		var company_id = result.insertId;
    		for(let i = 0;i < imgs.length;i++) {
    			inner_qiyemingpian_img_save += '('+company_id+',"'+imgs[i]+'"),';
    		}
    		inner_qiyemingpian_img_save = inner_qiyemingpian_img_save.substring(0,inner_qiyemingpian_img_save.length-1);
    		connection.query(inner_qiyemingpian_img_save,function (err2, result2) {
    			if(err2){
    				console.log('[INSERT ERROR] - ',err2.message);
    				res.json({err:true,msg:'insert imgs fail'});
    				return;
    			}
    			res.json({err:false,msg:'success',id:company_id});
    		});          
    	});
    }, function(error){
    	res.json({err:true,msg:'exchange for userId fail'});
    });
});

//企业名片删除-暂时不用
router.post('/qiyemingpian_del', function(req, res, next) {
	res.json({err:true,msg:'no api'});
});
//企业名片详情
router.post('/qiyemingpian_detail', function(req, res, next) {
	var params = req.body;
	if(!params){
		res.json({err:true,msg:'empty params'});
		return;
	}
	if(!params.openid){
		res.json({err:true,msg:'empty openid'});
		return;
	}
	if(!params.id){
		res.json({err:true,msg:'empty id'});
		return;
	}
	exchangeForUserId(params.openid).then(function(data){
    	//用户存在
    	var innersql = qiyemingpian_detail_sql + ' where id = ' + params.id + ' AND if_del != 1';
    	//根据openid查询
    	connection.query(innersql,function (err, result) {
    		if(err){
    			console.log('[SELECT ERROR] - ',err.message);
    			res.json({err:true,msg:'select error'});
    			return;
    		}
    		var user_id = result[0].user_id;
    		var company_id = result[0].id;
    		var innersql2 = sql + ' where id ="' + user_id + '"';
    		var innersql3 = 'SELECT img FROM ppx_huibian_companycard_img where company_id='+company_id;
    		//使用promise.all方法控制并列异步
    		const p1 = new Promise((resolve, reject) => {
  				connection.query(innersql2,function (err2, result2) {
    				if(err2){
    					resolve([{openid:''}]);
    				}else{
    					resolve(result2);
    				}
    			});
			}); 
			const p2 = new Promise((resolve, reject) => {
  				connection.query(innersql3,function (err3, result3) {
    				if(err3){
    					resolve([]);
    				}else{
    					resolve(result3);
    				}
    			});
			});
			Promise.all([p1,p2]).then(([r1, r2]) => {
				result[0].imgs = r2;
				res.json({err:false,msg:'success',data:result,openid:r1[0].openid});//result类型为array
			}).catch(e => {
				console.log(e)
				res.json({err:true,msg:'get openid or imgs fail'});
			});
    	});
    },function(error){
    	res.json({err:true,msg:'no user exist!'});
    })
});
//收藏列表
router.post('/qiyemingpian_favoritelist', function(req, res, next) {
	var params = req.body;
	if(!params){
		res.json({err:true,msg:'empty params'});
		return;
	}
	if(!params.openid){
		res.json({err:true,msg:'empty openid'});
		return;
	}
	exchangeForUserId(params.openid).then(function(data){
		var user_id = data.user_id;
		var innersql = 'SELECT ppx_huibian_companycard.* FROM ppx_huibian_companycard,ppx_huibian_companycard_favorite where ppx_huibian_companycard.id=ppx_huibian_companycard_favorite.cid AND ppx_huibian_companycard_favorite.user_id='+user_id +' AND if_del = 0';
		connection.query(innersql,function (err, result) {
			if(err){
    			console.log('[SELECT ERROR] - ',err.message);
    			res.json({err:true,msg:'select error'});
    			return;
    		}
    		res.json({err:false,msg:'success',data:result});//result类型为array
		});
	},function(error){
		res.json({err:true,msg:'no user exist!'});
	});
});
//我创建的
router.post('/qiyemingpian_mycreate', function(req, res, next) {
	var params = req.body;
	if(!params){
		res.json({err:true,msg:'empty params'});
		return;
	}
	if(!params.openid){
		res.json({err:true,msg:'empty openid'});
		return;
	}
	exchangeForUserId(params.openid).then(function(data){
		var user_id = data.user_id;
		var innersql = 'SELECT * FROM ppx_huibian_companycard where user_id='+user_id +' AND if_del = 0';
		connection.query(innersql,function (err, result) {
			if(err){
    			console.log('[SELECT ERROR] - ',err.message);
    			res.json({err:true,msg:'select error'});
    			return;
    		}
    		res.json({err:false,msg:'success',data:result});//result类型为array
		});
	},function(error){
		res.json({err:true,msg:'no user exist!'});
	});
});
//收藏
router.post('/qiyemingpian_favorite', function(req, res, next) {
	var params = req.body;
	if(!params){
		res.json({err:true,msg:'empty params'});
		return;
	}
	if(!params.openid){
		res.json({err:true,msg:'empty openid'});
		return;
	}
	if(!params.id){
		res.json({err:true,msg:'empty id'});
		return;
	}
	if(!params.type){
		res.json({err:true,msg:'empty type'});
		return;
	}
	var id = params.id;
	var type = params.type;
	exchangeForUserId(params.openid).then(function(data){
		var user_id = data.user_id;
		var innersql = '',
			innersql2 = '';
		if(params.type == 0) {
			innersql = 'DELETE FROM ppx_huibian_companycard_favorite where user_id='+user_id+' AND cid='+id;
			innersql2 = "update ppx_huibian_companycard set favoritenum=favoritenum-'1' where id = "+id;
		}else{
			innersql = 'INSERT INTO ppx_huibian_companycard_favorite(user_id,cid,time) VALUES('+user_id+','+id+','+(new Date()).toLocaleDateString()+')';
			innersql2 = "update ppx_huibian_companycard set favoritenum=favoritenum+'1' where id = "+id;
		}
		connection.query(innersql,function (err, result) {
			if(err){
    			console.log('[SELECT ERROR] - ',err.message);
    			res.json({err:true,msg:'insert or delete error'});
    			return;
    		}
    		connection.query(innersql2,function (err2, result2) {
    			if(err2){
    				console.log('[SELECT ERROR] - ',err.message);
    				res.json({err:true,msg:'update favoritenum fail'});
    				return;
    			}
    			res.json({err:false,msg:'success'});//result类型为array
    		});
		});
	},function(error){
		res.json({err:true,msg:'no user exist!'});
	});
});
//生成二维码
router.post('/qiyemingpian_qrcode', function(req, res, next) {
	res.json({err:true,msg:'wait develop'});
});
//上传logo
//单文件上传
router.post('/upload_logo', upload.single('logo'), function(req, res, next) {
	//req.file是前端文件name=logo的文件信息
	// 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
    // 对临时文件转存，fs.rename(oldPath, newPath,callback);
	fs.rename(req.file.path, './public/upload/images/' + req.file.originalname, function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功!');
        res.json({err:false,msg:'success',path:'upload/images/' + req.file.originalname});
    })
});
//上传图片
router.post('/upload_imgs', upload.array('imgs', 9), function(req, res, next) {
	var ep = new eventproxy();
	var paths = [];
	ep.after('renameFile',req.files.length,function(success){
		res.json({err:false,msg:'success',paths:paths});
	});
	// req.files 是 前端表单name=="imageFile" 的多个文件信息（数组）,限制数量5，应该打印看一下
	for(let i = 0;i < req.files.length;i++) {
		// 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
		// 对临时文件转存，fs.rename(oldPath, newPath,callback);
		paths.push('upload/images/' + req.file[i].originalname);
		fs.rename(req.file[i].path, './public/upload/images/' + req.file[i].originalname, function(err) {
        	if (err) {
            	throw err;
        	}
        	console.log('上传成功!');
        	ep.emit('renameFile','success');
    	})
	}
});
//首页列表
router.get('/qiyemingpian_list', function(req, res, next) {
	var innersql = 'SELECT * FROM ppx_huibian_companycard where if_del = 0';
	connection.query(innersql,function (err, result) {
		if(err){
			console.log('[SELECT ERROR] - ',err.message);
			res.json({err:true,msg:'select error'});
			return;
		}
    	res.json({err:false,msg:'success',data:result});//result类型为array
    });
});
//查看企业名片
router.post('/qiyemingpian_read', function(req, res, next) {
	var params = req.body;
	if(!params){
		res.json({err:true,msg:'empty params'});
		return;
	}
	if(!params.openid){
		res.json({err:true,msg:'empty openid'});
		return;
	}
	if(!params.id){
		res.json({err:true,msg:'empty id'});
		return;
	}
	exchangeForUserId(params.openid).then(function(data){
		var id = params.id;
		var innersql = "update ppx_huibian_companycard set readnum=readnum+'1' where id = "+id;
		connection.query(innersql,function (err, result) {
			if(err){
    			console.log('[SELECT ERROR] - ',err.message);
    			res.json({err:true,msg:'update readnum error'});
    			return;
    		}
    		res.json({err:false,msg:'update readnum success'});//result类型为array
		});
	},function(error){
		res.json({err:true,msg:'no user exist!'});
	});
});

module.exports = router;