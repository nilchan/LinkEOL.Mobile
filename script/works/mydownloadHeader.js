
var viewDetail = false;
//查看下载作品详情
window.addEventListener('changeHeaderViewState',function(event) {
	viewDetail = true;
	document.getElementsByClassName('mui-title')[0].innerText = event.detail.workTitle;
});

var oldBack = mui.back;
mui.back = function() {
	//alert(viewDetail);
	if(viewDetail){
		viewDetail = false;
		document.getElementsByClassName('mui-title')[0].innerText = '我的下载';
		
		//触发Content页面的事件
		var children = plus.webview.currentWebview().children();
		if (children.length > 0) {
			mui.fire(children[0], 'changeContentViewState', {});
		}
	}
	else{
		//触发Content页面的事件
		var children = plus.webview.currentWebview().children();
		if (children.length > 0) {
			mui.fire(children[0], 'changeContentViewState', {});
		}
		
		//common.showIndexWebview(4);
		oldBack();
	}
};

