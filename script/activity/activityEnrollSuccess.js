var viewModel = function() {
	var self = this;
	
	var ID;
	self.needWorks = ko.observable(true);
	
	//跳转到所有作品页面
	self.gotoAllWorks = function() {
		setLocalItem('tmp.activityWorkID', ID);
		common.transfer("../works/worksListAllHeader.html", false, {}, false, false);
	}

	//跳转到活动页面
	self.gotoActivity = function() {
		common.transfer("../activity/activityInfo.html", false, {
			aid: ID
		});
	}

	mui.back = function() {
		common.transfer('activityInfo.html', true, {
			aid: ID
		});
	};
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		if (typeof(web.needWorks) !== "undefined") {
			self.needWorks(web.needWorks);
		}
	});
}

ko.applyBindings(viewModel);
