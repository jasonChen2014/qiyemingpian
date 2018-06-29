var express = require('express');
var router = express.Router();
var URL = require('url');
//控制异步
var eventproxy = require('eventproxy');
//加载mysql模块
var mysql = require('mysql');
//创建连接
var connection = mysql.createConnection('mysql://zuv4mhvs0zr2eaa0:password@o677vxfi8ok6exrd.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/nxnbkp5g4lsyl88q');
// var connection = mysql.createConnection({
// 	host     : 'localhost',
// 	user     : 'root',
// 	password : 'password',
// 	database : 'qiyemingpian'
// });
//执行创建连接 
connection.connect();
//SQL语句
var  sql = 'SELECT * FROM ppx_huibian_user';
var  addSql = 'INSERT INTO ppx_huibian_user(openid,nickname,headimg,country,province,city,gender,appnum) VALUES(?,?,?,?,?,?,?,?)';
var  addSql2= 'INSERT INTO ppx_huibian_suggesstion(user_id,suggesstion,appnum,create_time) VALUES(?,?,?,?)';

/*
** openid 换取 user_id
*/
function exchangeForUserId(openid){
	return new Promise(function(resolve,reject){
		//根据openid查询
		var innersql = sql + ' where openid="' + openid + '"';
		connection.query(innersql,function (err, result) {
			if(err || result.length == 0){
				console.log('[SELECT ERROR] - ',err);
				reject({err:true});
				return;
			}
			resolve({user_id:result[0].id});
		});
	});
}

/*
** user_info接口
** param openid
*/
router.post('/user_info', function(req, res, next) {
	//console.log(req.body);
	//res.json(req.body);
	
    //解析请求参数
    //var params = URL.parse(req.url, true).query;
    var params = req.body;
    if(!params){
    	res.json({err:true,msg:'empty openid'});
    	return;
    }
    var openid = params.openid;
    if(!openid) {
    	res.json({err:true,msg:'empty openid'});
    	return;
    }
    var innersql = sql + ' where openid="' + openid + '"';
    //根据openid查询
    connection.query(innersql,function (err, result) {
    	if(err){
    		console.log('[SELECT ERROR] - ',err);
    		res.json({err:true,msg:'select error'});
    		return;
    	}
    	res.json({err:false,msg:'success',data:result});//result类型为array
    });
});

/*
** 接口login
** param [openid,nickname,avatarUrl,country,province,city,gender]
*/
router.post('/login', function(req, res, next) {
	//console.log(req.body);
	//res.json(req.body);
	
    //解析请求参数
    //var params = URL.parse(req.url, true).query;
    var params = req.body;
    if(!params){
    	res.json({err:true,msg:'empty data'});
    	return;
    }
    if(!params.openid){
    	res.json({err:true,msg:'empty openid'});
    	return;
    }
    //通过openid判断该用户是否已存在
    exchangeForUserId(params.openid).then(function(data){
    	var user_id = data.user_id;
    	res.json({err:false,msg:'success',id:user_id});   
    },function(error){
    	//不存在该用户
    	if(!params.nickname){
    		res.json({err:true,msg:'empty nickname'});
    		return;
    	}
    	if(!params.avatarUrl){
    		res.json({err:true,msg:'empty avatarUrl'});
    		return;
    	}
    	if(!params.appnum){
    		res.json({err:true,msg:'empty appnum'});
    		return;
    	}
    	var addSqlParams = [params.openid,params.nickname,params.avatarUrl,params.country,params.province,params.city,params.gender,params.appnum];

    	//增
    	connection.query(addSql,addSqlParams,function (err, result) {
    		if(err){
    			console.log('[INSERT ERROR] - ',err);
    			res.json({err:true,msg:'insert fail'});
    			return;
    		}
    		res.json({err:false,msg:'success',id:result.insertId});             
    	});
    });
});

/*
** 接口suggestion
** param [openid,suggesstion,appnum]
*/
router.post('/suggestion', function(req, res, next) {
	//console.log(req.body);
	//res.json(req.body);
	
    //解析请求参数
    //var params = URL.parse(req.url, true).query;
    var params = req.body;
    if(!params){
    	res.json({err:true,msg:'empty data'});
    	return;
    }
    if(!params.openid){
    	res.json({err:true,msg:'empty openid'});
    	return;
    }
    if(!params.suggestion){
    	res.json({err:true,msg:'empty suggestion'});
    	return;
    }
    if(!params.appnum){
    	res.json({err:true,msg:'empty appnum'});
    	return;
    }
    exchangeForUserId(params.openid).then(function(data){
    	var user_id = data.user_id;
    	var addSqlParams = [user_id,params.suggestion,params.appnum,(new Date()).toLocaleDateString()];//注意数据库的字段是suggesstion
    	//增
    	connection.query(addSql2,addSqlParams,function (err, result) {
    		if(err){
    			console.log('[INSERT ERROR] - ',err);
    			res.json({err:true,msg:'insert fail'});
    			return;
    		}
    		res.json({err:false,msg:'success',id:result.insertId});             
    	});
    }, function(error){
    	res.json({err:true,msg:'exchange for userId fail'});
    });
});

module.exports = router;