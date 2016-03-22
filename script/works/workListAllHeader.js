var worksHeader = function() {
	var self = this;
	self.allWorksTitle = ko.observable('名师作品');
	self.actID = ko.observable(0); //具体某个活动ID
	self.seachValue = ko.observable('');
	var isFamous; //是否为名师
	self.isSeach = ko.observable(true);

	mui.plusReady(function() {
		var WorkUserType;
		var thisWeb = plus.webview.currentWebview();
		if (typeof thisWeb.WorkUserType != "undefined") {
			WorkUserType = thisWeb.WorkUserType;
			if (WorkUserType == common.gDictUserType.student) {
				self.allWorksTitle('学生作品');
			}
			if (typeof thisWeb.isFamous != "undefined") {
				isFamous = thisWeb.isFamous;
				if (WorkUserType == common.gDictUserType.teacher) {
					if (isFamous == false) {
						self.allWorksTitle('专业老师作品');
					} else {
						self.allWorksTitle('名师作品');
					}
				}
			}

		}else{
			self.allWorksTitle('所有作品');
		}
		var topPx = '46px';
		if (plus.os.vendor == 'Apple') {
			topPx = '61px';
		}
		var pageAll = mui.preload({
			url: "worksListAllWorks.html",
			id: "worksListAllWorks.html",
			styles: {
				top: topPx,
				bottom: '0px',
			},
			extras: {
				workUserType: WorkUserType,
				IsFamous: isFamous
			}, //额外扩展参数
			show: {
				autoShow: false,
				aniShow: "slide-in-right",
				duration: "100ms"
			}

		});
		//plus.nativeUI.showWaiting();
		thisWeb.append(pageAll);

		var actID = getLocalItem('tmp.activityWorkID');
		if (typeof(actID) !== "undefined") {
			self.actID(actID);
		}

		//common.showCurrentWebview();
	})

	// 所有作品页面选择类
	var currentWebview = null;
	document.querySelector("#seachEvent").addEventListener('tap', function() {
		if (self.isSeach() == true) {
			self.isSeach(false);
			var seachInput=document.getElementById("seachInput");
				seachInput.focus();	
		} else if (self.isSeach() == false && common.StrIsNull(self.seachValue()) != '') {
			plus.nativeUI.showWaiting();
			currentWebview = plus.webview.currentWebview().children()[0];
			mui.fire(currentWebview, 'seachworks', {
				seachValue: self.seachValue()
			});
		} else if(self.isSeach() == false && common.StrIsNull(self.seachValue()) == ''){
			self.isSeach(true);
		}
	});
	
	//筛选弹出框
	document.querySelector('#filtrate-icon').addEventListener('tap', function() {
		self.isSeach(true);
		if (currentWebview == null) {
			currentWebview = plus.webview.currentWebview().children()[0];
		}
		currentWebview.evalJS("mui('#pull-down-nav').popover('toggle')");
	});

	
	self.seachValueEvent = function() {
		plus.nativeUI.showWaiting();
		currentWebview = plus.webview.currentWebview().children()[0];
		mui.fire(currentWebview, 'seachworks', {
			seachValue: self.seachValue()
		});
	}
	

}
ko.applyBindings(worksHeader);