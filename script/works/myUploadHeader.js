var subId = 'myUpload.html';
var subPage = null;

mui.plusReady(function() {
	/*var topPx = '48px';
	if (plus.os.vendor == 'Apple') {
		topPx = '63px';
	}
	
	console.log('plusReady');

	mui.init({
		subpages: [{
			url: subId,
			id: subId,
			styles: {
				top: topPx,
				bottom: '0px',
			}
		}]
	});*/
});

/*window.addEventListener('triggerUploadHeader',function () {
	if(!subPage){
		subPage = plus.webview.getWebviewById(subId);
	}
	if(subPage) {	//若第一次创建，subPage无法立刻创建，此时由subPage的plusReady触发
		mui.fire(subPage,'triggerUpload',{});
	}
})*/

//返回按钮
mui.back = function() {
	common.transfer('worksListMyHeader.html', true, {}, false, false);
	
}