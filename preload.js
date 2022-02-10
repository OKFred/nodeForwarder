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
	oldServer:"http://127.0.0.1:80",
};
var users={
	oldServer:"",
	newServer:'',
};

function environmentSetting(){
document.getElementById("inputOldServer").placeholder='80';
document.getElementById("inputOldServer").addEventListener("change",(e)=>{
	let result=e.target.value.trim();
	if (!result ||isNaN(Number(result))){
		users.oldServer='';
		document.getElementById("inputOldServer").placeholder='80'
		return;
	};
	users.oldServer='http://127.0.0.1:'+result;
	document.getElementById("inputOldServer").value=result;
});
	document.getElementById("inputNewServer").addEventListener("change",(e)=>{
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
		document.getElementsByTagName("label")[0].innerText="OK✔";
		setTimeout(()=>{document.getElementsByTagName("label")[0].innerText="切换";},1500)
	});
	electronInfo();
};

function serverStart(){
	let options = {
		target: users.newServer, // target host
		changeOrigin: true, // needed for virtual hosted sites
		ws: true, // proxy websockets
		/* pathRewrite: {
			'^/api/old-path': '/api/new-path', // rewrite path
			'^/api/remove/path': '/path', // remove base path
		}, */
	};
	let exampleProxy = createProxyMiddleware(options);
	app.use('*', exampleProxy);
	let oldServer=(users.oldServer)?users.oldServer:defaultSetting.oldServer;
	let oldPort=new URL(oldServer).port||80;
	expressServer=app.listen(oldPort, ()=> {
		console.log(`web服务已启用，[${oldServer}] 将转发到👉${users.newServer}`);
	});
	document.getElementById("inputOldServer").setAttribute("disabled","");
	document.getElementById("inputNewServer").setAttribute("disabled","");
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