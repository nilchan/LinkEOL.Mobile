var subpageId = 'mydownload.html';

mui.plusReady(function() {
	var topPx = '48px';
	if (plus.os.vendor == 'Apple') {
		topPx = '63px';
	}

	mui.init({
		subpages: [{
			url: "mydownload.html",
			id: subpageId,
			styles: {
				top: topPx,
				bottom: '0px',
			}
		}]
	});
});

var viewDetail = false;
//查看下载作品详情
window.addEventListener('changeHeaderViewState',function(event) {
	viewDetail = true;
	document.getElementsByClassName('mui-title')[0].innerText = event.detail.workTitle;
});

mui.back = function() {
	if(viewDetail){
		viewDetail = false;
		document.getElementsByClassName('mui-title')[0].innerText = '我的下载';
		
		//触发Content页面的事件
		var sub = plus.webview.getWebviewById(subpageId);
		if (sub != null) {
			mui.fire(sub, 'changeContentViewState', {});
		}
	}
	else{
		common.showIndexWebview(4);
	}
};

