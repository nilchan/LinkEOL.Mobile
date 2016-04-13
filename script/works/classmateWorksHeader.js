var classmateWorksHeader = function() {
	var self = this;
	mui.plusReady(function() {
		var WorkUserType;
		var thisWeb = plus.webview.currentWebview();
		if (typeof thisWeb.WorkUserType != "undefined") {
			WorkUserType = thisWeb.WorkUserType;
		}
		var topPx = '50px';
		if (plus.os.vendor == 'Apple') {
			topPx = '65px';
		}
		var pageAll = mui.preload({
			url: "classmateWorks.html",
			id: "classmateWorks.html",
			styles: {
				top: topPx,
				bottom: '0px',
			},
			extras: {
				workUserType: WorkUserType
			}, //额外扩展参数
			show: {
				autoShow: false,
				aniShow: "slide-in-right",
				duration: "100ms"
			}

		});
		plus.nativeUI.showWaiting();
		thisWeb.append(pageAll);
		
	})

	// 所有作品页面选择类
	var currentWebview = null;
	document.querySelector("#classmateList").addEventListener('tap', function() {
		common.transfer('../my/classmateListHeader.html',true,{},false,false);
	});
	
}
ko.applyBindings(classmateWorksHeader);