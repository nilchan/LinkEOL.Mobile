var classmateListHeader = function() {
	var self = this;
	mui.plusReady(function() {
		var WorkUserType;
		var thisWeb = plus.webview.currentWebview();
		if (typeof thisWeb.WorkUserType != "undefined") {
			WorkUserType = thisWeb.WorkUserType;
		}
		var topPx = '46px';
		if (plus.os.vendor == 'Apple') {
			topPx = '61px';
		}
		var pageAll = mui.preload({
			url: "classmateList.html",
			id: "classmateList.html",
			styles: {
				top: topPx,
				bottom: '0px',
			},
			extras: {
				
			}, //额外扩展参数
			show: {
				autoShow: false,
				aniShow: "slide-in-right",
				duration: "100ms"
			}

		});
		plus.nativeUI.showWaiting();
		thisWeb.append(pageAll);
		common.showCurrentWebview();
		
	})
}
ko.applyBindings(classmateListHeader);