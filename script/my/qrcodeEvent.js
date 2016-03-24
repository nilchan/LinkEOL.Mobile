var ws=null;
var scan=null,domready=false;
// H5 plus事件处理
function plusReady(){
	if(ws||!window.plus||!domready){
		return;
	}
	// 获取窗口对象
	ws=plus.webview.currentWebview();
	// 开始扫描
	//ws.addEventListener('show',function(){
		common.showCurrentWebview();
		scan=new plus.barcode.Barcode('bcid');
		
	    scan.onmarked=onmarked;
	    scan.onerror = onerror;
	    scan.start();
	    
	//});
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener("plusready",plusReady,false);
}
// 监听DOMContentLoaded事件
document.addEventListener("DOMContentLoaded",function(){
	domready=true;
	plusReady();
},false);
// 二维码扫描成功
function onmarked(type, result) {
	//scan.cancel();
	switch (type) {
		case plus.barcode.QR:
			type = "QR";
			break;
		default:
			type = "其它";
			break;
	}
	result = result.replace(/\n/g, '');
	//console.log(result);
	common.transfer("favUser.html", false, {
		result: result
	}, false, false);
}

//二维码扫码失败
function onerror(error) {
	console.log("扫描失败")
}
