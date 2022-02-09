"use strict";
console.log('log on');
chrome.webRequest.onBeforeSendHeaders.addListener(...handleRequest());
function handleRequest(){   //For dev
	return [
		(details)=>{
			if (!/^chrome-extension/.test(details.initiator)) return;
			let {requestHeaders, url}=details;
			requestHeaders.forEach(headerObj=>{
				if (/origin|referer|referrer/gi.test(headerObj.name)) delete headerObj[headerObj.name];
			});
			let orgin=new URL(url).origin;
			requestHeaders.push({name:"Origin",value:orgin},{name:"Referer",value:orgin});
			return {requestHeaders};
		},
		{urls: ["<all_urls>"]},
		["blocking", "requestHeaders", "extraHeaders"]
	]
};

/* 1915
20220208 */