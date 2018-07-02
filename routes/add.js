var express = require('express');
var router = express.Router();
var URL = require('url');
//加载mysql模块
var mysql = require('mysql');
//创建连接
//被自己蠢哭了。。。
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
var  addSql = 'INSERT INTO ppx_huibian_user(openid,nickname,mobile,country,province,city) VALUES(?,?,?,?,?,?)';

router.post('/', function(req, res, next) {
	//console.log(req.body);
	//res.json(req.body);
	
    //解析请求参数
    //var params = URL.parse(req.url, true).query;
    var params = req.body;
    var addSqlParams = [params.openid, params.nickname, params.mobile,params.country, params.province, params.city];

    //增
    connection.query(addSql,addSqlParams,function (err, result) {
    	if(err){
    		console.log('[INSERT ERROR] - ',err.message);
    		res.json({err:true,msg:'insert fail'});
    		return;
    	}
    	res.json({err:false,id:result.insertId});             
    });

    //查
    /*
    connection.query(sql,function (err, result) {
    	if(err){
    		console.log('[SELECT ERROR] - ',err.message);
    		return;
    	}
    	console.log(params.id);

        //把搜索值输出
        res.send(result);
    });*/
});

router.post('/research', function(req, res, next) {
	var nickname = req.body.nickname;
	var innersql = sql + ' where nickname = "' + nickname +'"';
	//查
    connection.query(innersql,function (err, result) {
    	if(err){
    		console.log('[SELECT ERROR] - ',err.message);
    		res.json({err:true,msg:'research fail'});
    		return;
    	}

        //把搜索值输出
        res.json({err:false,data:result});
    });
});

module.exports = router;