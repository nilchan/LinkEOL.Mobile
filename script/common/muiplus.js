(function(w){
// 空函数
function shield(){
	return false;
}
document.addEventListener('touchstart',shield,false);//取消浏览器的所有事件，使得active的样式在手机上正常生效
document.oncontextmenu=shield;//屏蔽选择函数
// H5 plus事件处理
var ws=null,as='pop-in';
function plusReady(){
	ws=plus.webview.currentWebview();
	
}
if(w.plus){
	plusReady();
}else{
	document.addEventListener('plusready',plusReady,false);
}
// DOMContentLoaded事件处理
var domready=false;
document.addEventListener('DOMContentLoaded',function(){
	domready=true;
	document.body.onselectstart=shield;
},false);
})(window);