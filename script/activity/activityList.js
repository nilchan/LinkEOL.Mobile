var viewModel = function() {
	var self = this;
	var page = [1, 1, 1, 1, 1];
	self.activitys = [];
	self.activitys[0] = ko.observableArray([]);
	self.activitys[1] = ko.observableArray([]);
	self.activitys[2] = ko.observableArray([]);
	self.activitys[3] = ko.observableArray([]);
	self.activitys[4] = ko.observableArray([]);
	var activityUrl = common.gServerUrl + "API/Activity/GetActivityInfoList?page=";

	var places = ['广州', '深圳', '佛山', '肇庆', '江门', '中山', '顺德', '珠海', '东莞', '惠州'];
	self.bindPlace = ko.observableArray(places);
	var currentPlace = '广州';
	self.cPlace = ko.observable(currentPlace);

	mui.init();
	//阻尼系数
	var deceleration = mui.os.ios ? 0.003 : 0.0009;
	mui('.mui-scroll-wrapper').scroll({
		bounce: false,
		indicators: true, //是否显示滚动条
		deceleration: deceleration
	});
	mui.plusReady(function() {
		//循环初始化所有下拉刷新，上拉加载。
		mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
			index++;
			mui(pullRefreshEl).pullToRefresh({
				down: {
					callback: function() {
						var self1 = this;
						setTimeout(function() {
							self1.endPullDownToRefresh(); //refresh completed
							self1.refresh(true);
							page[index] = 1; //重新加载第1页
							self.getActivity(index, self.activitys[index]);
						}, 1000);
					}
				},
				up: {
					callback: function() {
						var self1 = this;
						setTimeout(function() {
							page[index]++;
							if (plus.networkinfo.getCurrentType() > 1) {
								var url = activityUrl + page[index] + '&ActProperty=' + index + '&Place=' + self.cPlace();
								mui.ajax(url, {
									type: 'GET',
									success: function(responseText) {
										var result = eval("(" + responseText + ")");
										if (result && result.length > 0) {
											self.activitys[index](self.activitys[index]().concat(result));
											if (result.length < common.gListPageSize) {
												self1.endPullUpToRefresh(true);
											} else {
												self1.endPullUpToRefresh(false); //false代表还有数据
											}
										} else {
											self1.endPullUpToRefresh(true); //true代表没有数据了
										}
									}
								});
							}
						}, 1000);
					}
				}
			});
		});
	});

	//获取活动列表
	self.getActivity = function(index, data) {
		var url = activityUrl + page[index] + '&ActProperty=' + index + '&Place=' + self.cPlace();
		mui.ajax(url, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				data(responseText);
			}
		});
	};

	//获取活动列表首页
	self.getActivityIndex = function() {
		mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
			mui(pullRefreshEl).pullToRefresh().refresh(true);
		});
		var url = common.gServerUrl + '/API/Activity/GetActivityIndexList' + '?Place=' + self.cPlace();
		mui.ajax(url, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				//console.log(JSON.stringify(responseText));
				responseText.forEach(function(item) {
					switch (item.ActProperty) {
						case 1:
							{
								self.activitys[1].push(item);
								break;
							}
						case 2:
							{
								self.activitys[2].push(item);
								break;
							}
						case 3:
							{
								self.activitys[3].push(item);
								break;
							}
						case 4:
							{
								self.activitys[4].push(item);
								break;
							}
					}
				});

			}
		});
	}

	//选择地点
	self.selectPlace = function(data) {
		currentPlace = data;
		setLocalItem('currentPlace', currentPlace);
		self.cPlace(currentPlace);
		for (var i = 1; i < 5; i++) {
			self.activitys[i]([]);
			page[i] = 1;
		}
		self.getActivityIndex();
		mui('#topPopover').popover('toggle');
	}

	//跳到活动详情
	self.gotoInfo = function(data) {
		common.transfer('activityInfo.html', false, {
			aid: data.ID
		}, false, false);
	}

	//覆写返回
	mui.back = function() {
		common.confirmQuit();
	}

	window.addEventListener('setActive', function(e) {
		if ( !!e.detail.activePage ) {
			var activePage=e.detail.activePage;
			$('#sliderSegmentedControl > .mui-scroll').children().each(function(index){
				if( index === activePage ) {
					$(this).addClass('mui-active');
				} else {
					$(this).removeClass('mui-active');
				}
			});
			var width = document.body.clientWidth;
			$('#activity-list-page')[0].style.cssText = 'transform: translate3d(-'+ width * activePage +'px, 0px, 0px) translateZ(0px);-webkit-transform: translate3d(-'+ width * activePage +'px, 0px, 0px) translateZ(0px); transition-duration: 0ms;'; 
		}

	})

	//页面初始化
	mui.plusReady(function() {
		var defaultPlace = getLocalItem('currentPlace');
		if (typeof defaultPlace != 'undefined' && common.StrIsNull(defaultPlace) != '') {
			self.cPlace(defaultPlace);
		}

		self.getActivityIndex();
	});
};

ko.applyBindings(viewModel);