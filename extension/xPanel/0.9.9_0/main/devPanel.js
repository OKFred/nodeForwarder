"use strict";
const E={};	/* Elements 节点 */
E.QueryInfo=document.getElementById("QueryInfo");	/* 提示信息 */
E.SelectMethod=document.getElementById("SelectMethod");	/* 请求方式 */
E.DataType=document.getElementById("DataType");	/* 数据类型 */
E.AutoClear=document.getElementById("AutoClear");	/* 自动刷新 */
E.Redirect=document.getElementById("Redirect");	/* 自动刷新 */
E.Credentials=document.getElementById("Credentials");	/* Cookies */
E.Send=document.getElementById("Send");	/* 表单提交按钮 */
E.InputURL=document.getElementById("InputURL");	/* URL地址 */
E.TextHeaders=document.getElementById("TextHeaders");	/* 数据头 */
E.TextBody=document.getElementById("TextBody");	/* 对象 */
E.RequestResult=document.getElementById("RequestResult");	/* 返回结果 */

E.TextHeaders.addEventListener('input', resizeRow);
E.TextBody.addEventListener('input', resizeRow);

console.log("dev panel here")

function resizeRow(){	/* 调整行高 */
	let str =this.value;
	let rowsNeeded=3;
	if(str.match(/\n/g)!=null){
		rowsNeeded=str.match(/\n/g).length+2;
		str=str.replace(/\n,''/g);
	};
	this.rows = rowsNeeded;
};

E.SelectMethod.addEventListener('change',()=>{
	if (E.SelectMethod.value=='GET'){
		E.DataType.selectedOptions[0].innerText='Plain text';
		E.DataType.setAttribute('disabled','');
	}else{
		E.DataType.selectedOptions[0].innerText=E.DataType.selectedOptions[0].value;
		E.DataType.removeAttribute('disabled');
	};
});
E.Send.addEventListener('click', validation);

async function validation(){
	queryResult(false, `Checking...`);
	E.RequestResult.innerHTML='';
	let method=E.SelectMethod.value;
	let type=E.DataType.value;
	let url=E.InputURL.value.trim();
	let headers=E.TextHeaders.value.trim().replace(/\n/g,'');
	let body=E.TextBody.value.trim().replace(/\n/g,'');
	let credentials=E.Credentials.checked;
	if (!url) return queryResult(false, `URL missing`);	/* 必填参数 */
	if (!/^http/gi.test(url)) url='http://'+url;
	E.InputURL.value=url;
	let queryObj={
		"request": {
			"header":{method},
			"url": url,
			"data":"",
		},
		"response": {"data": {}},
		"info": {"type": "dev"}
	};
	if (body){
		try{
			queryObj.request.data=JSON.parse(body);
			E.TextBody.value=JSON.stringify(queryObj.request.data, null, '\t');
		}catch(e){
			return queryResult(false, `Body malformed`);
		};
	};
	if (!credentials) queryObj.request.header.credentials='omit'; 
	if (method=='POST') queryObj.request.header["Content-Type"]=type;
	(E.Redirect.checked)?delete queryObj.request.header["redirect"] :queryObj.request.header["redirect"]='manual';
	if (headers!=''){	/* 额外 headers */
		try{
			queryObj.request.header.headers=JSON.parse(headers);
			E.TextHeaders.value=JSON.stringify(queryObj.request.header.headers, null, '\t')
		}catch(e){
			return queryResult(false, `Headers malformed`);
		};
	};
	let res;
	try{res=await doFetch(queryObj)}catch(e){
		return queryResult(false, `network error: `+e.message);
	}
	let data=res.response.data;
	let {redirected,status,statusText,ok}=res.response.net;
	let result=typeof(data)=='object'?JSON.stringify(data):data;
	E.RequestResult.innerText=result;
	queryResult(ok, `Redirected: ${redirected}; \n Status: ${status} ${statusText}; \n Length: ${result.length}`);
	data=(typeof(data)=='object')? "console.log("+JSON.stringify(data)+")":"console.log(`"+data+"`)";
	let code=(E.AutoClear.checked)? "console.clear();"+data: "console.log('%c'+'++++++++++++++++++++', 'color: red');"+data;
	chrome.devtools.inspectedWindow.eval(code, (result, isException)=>{
		if (isException) return console.log('Exception: '+result);
		return console.log('Execution: '+result);
	});
	return;
};

function queryResult(ok, info){
	let ele=E.QueryInfo;
	if (typeof(info)=='undefined'){
		info='query success!';
	}else if (typeof(info)=='object'){
		info=JSON.stringify(info);
	};
	ele.innerText=info;
	(!ok)? ele.style.color='orangered' : ele.style.color='seagreen';
};