"use strict";
console.log('server time--服务器开机');

//外部模块
let express = require('express');
let { createProxyMiddleware } = require('http-proxy-middleware');

//有权访问两个 渲染器全局 window/global
window.addEventListener('DOMContentLoaded', environmentSetting);

//自定义参数
var app=express();
var expressServer;
var defaultSetting={
	targetServer:"http://127.0.0.1:80",
};
var users={
	targetServer:"",
	newServer:'',
};

function environmentSetting(){
document.getElementById("inputTargetServer").placeholder=defaultSetting.targetServer;
document.getElementById("inputTargetServer").addEventListener("change",(e)=>{
	serverStop();
	let {status, result}=urlMapping(e);
	if (!status){
		document.getElementById("inputTargetServer").placeholder=defaultSetting.targetServer;
		return;
	};
	users.targetServer=result;
	document.getElementById("inputTargetServer").value=result;
});
	document.getElementById("inputNewServer").addEventListener("change",(e)=>{
		serverStop();
		let {status, result}=urlMapping(e);
		if (!status){
			document.getElementById("inputNewServer").placeholder='请填写';
			return;
		};
		users.newServer=result;
		document.getElementById("inputNewServer").value=result;
	});
	document.getElementById("inputConfirm").addEventListener("change",(e)=>{
		if (!users.newServer){
			e.target.checked=false;
			console.log("%c请输入新的服务器地址","color:orangered");
			return;
		};
		(e.target.checked)?serverStart():serverStop()&&location.reload();
		document.getElementById("inputConfirm").innerText="OK✔";
		setTimeout(()=>{document.getElementById("inputConfirm").innerText="切换";})
	});
	electronInfo();
};

function serverStart(){
	let options = {
		target: users.targetServer||defaultSetting.targetServer, // target host
		changeOrigin: true, // needed for virtual hosted sites
		ws: true, // proxy websockets
		/* pathRewrite: {
			'^/api/old-path': '/api/new-path', // rewrite path
			'^/api/remove/path': '/path', // remove base path
		}, */
		router: {
			// when request.headers.host == 'dev.localhost:3000',
			// override target 'http://www.example.org' to 'http://localhost:8000'
			[users.targetServer?new URL(users.targetServer).host:new URL(defaultSetting.targetServer).host]: users.newServer,
		}, 
	};
	let exampleProxy = createProxyMiddleware(options);
	app.use('*', exampleProxy);
	expressServer=app.listen(80, ()=> {
		console.log(`web服务已启用，[${(users.targetServer)?users.targetServer:defaultSetting.targetServer}] 将转发到👉${users.newServer}`);
	});
};

function serverStop(){
	document.getElementById("inputConfirm").checked=false;
	if (expressServer)expressServer.close(() => {
		console.log('Closed out remaining connections');
	});
	return true;
}

function urlMapping(e){
	let input=e.target.value.trim();
	if (!input){
		console.log("请输入正确的URL地址");
		return {'status':false, 'result':input};
	};
	if (!/^http/gi.test(input)) input='http://'+input;
	let url;
	try{
		url=new URL(input).origin;
	}catch(e){
		console.log("请输入正确的URL地址");
		return {'status':false, 'result':input};
	};
	return  {'status':true, 'result':url};
};

function electronInfo(){
	for (const dependency of ['chrome', 'node', 'electron']) {
		console.log(`${dependency}-ver.`, process.versions[dependency])
	};
};