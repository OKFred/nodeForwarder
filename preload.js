"use strict";
console.log('server time--服务器开机');

//外部模块
var express = require('express');
var formData = require('express-form-data');
const { createProxyMiddleware } = require('http-proxy-middleware');
const PORT=80; 

//有权访问两个 渲染器全局 (例如 window 和 document) 和 Node.js 环境
window.addEventListener('DOMContentLoaded', env);

//启用 Express
var app=express();
app.use(express.json()); //接收 POST 必备
app.use(express.urlencoded({ extended: true }));
app.use(formData.parse());
app.disable('x-powered-by');
function env(){
  (() => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
})();
  document.getElementById("serverInput").addEventListener("change",(e)=>{
    let input=e.target.value.trim();
    if (!input) return console.log("请输入正确的URL地址");
    let url;
    try{
      url=new URL(input).origin;
    }catch(e){
      return console.log("请输入正确的URL地址");
    };
    app.use('*', createProxyMiddleware({ target: url, changeOrigin: false }));
    app.listen(PORT, ()=> console.log(`web服务已启用，端口 [${PORT}]`));
    e.target.setAttribute("disabled","");
  })
};