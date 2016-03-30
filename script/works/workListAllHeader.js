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

		} else {
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
	});



	// 所有作品页面选择类
	var currentWebview = null;

	//筛选弹出框
	document.querySelector('#filtrate-icon').addEventListener('tap', function() {
		self.isSeach(true);
		if (currentWebview == null) {
			currentWebview = plus.webview.currentWebview().children()[0];
		}
		currentWebview.evalJS("mui('#pull-down-nav').popover('toggle')");
	});
	
	//--搜索功能--
	var t;
	$('#seachInput').bind('input propertychange', function() {
		clearTimeout(t);
		t = setTimeout(function() {
			seachValueEvent();
		}, 1000);
		
	});

	$('#seachBtn').click(function() {
		$('#input-search').toggleClass('list-search-show');
		$('#input-search').toggleClass('list-search-hide');
		$('.myAttention-bg-color').toggle();
		$('#seachBtn').hide();
		$('#seachBtnHide').show();
		if ($('#input-search').hasClass('list-search-show')) {
			$('#seachInput').focus();
		}
	});
	
	$('#seachBtnHide').click(function(){
		$('#seachInput').blur();
	});

	$(document).on('tap', '.mui-icon-clear', function() {
		seachValueEvent();
	});

	$('#seachInput').blur(function() {
		$('#input-search').removeClass('list-search-show');
		$('#input-search').addClass('list-search-hide');
		$('.myAttention-bg-color').show();
		$('#seachBtn').show();
		$('#seachBtnHide').hide();
	});
	
	function hiddenSeacher() {
		$('#seachInput').blur();
		$('#seachInput').val("");
		seachValueEvent();
	}

	function seachValueEvent() {
		var contentWebview = null;
		var seachValue = document.getElementById("seachInput").value;
		if (contentWebview == null) {
			contentWebview = plus.webview.currentWebview().children()[0];
		}
		mui.fire(contentWebview, 'seachworks', {
			seachValue: seachValue
		});
	}

	var old_back = mui.back;
	mui.back = function() {
		old_back();
		hiddenSeacher();
	}
	//--搜索功能--

}
ko.applyBindings(worksHeader);