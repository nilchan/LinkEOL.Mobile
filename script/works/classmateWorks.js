var classmateWorks = function() {
	var self = this;
	var pageNum = 1;
	var pageUrl = "&page=";
	var page = 1;
	var seachValue;
	var count = 0; //上拉刷新检测次数
	self.works = ko.observableArray([]);
	self.worksLength=ko.observable(1);

	//初始化界面
	mui.init({
		pullRefresh: {
			container: '#pullrefreshAll',
			down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});

	self.getAjaxUrl = function() {
		var curl = pageUrl + page;
		var baseUrl = common.gServerUrl + "API/Work/GetClassMateWorkList?userID="+getLocalItem('UserID');
	
		//console.log(baseUrl + curl)		
		return baseUrl + curl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText)
				var result = eval("(" + responseText + ")");
				self.works(result);
				self.worksLength(self.works().length);
				common.showCurrentWebview();
				plus.nativeUI.closeWaiting();
			}
		});
	}

	//下拉加载
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPulldownToRefresh(); //refresh completed
			page = 1;

			if (plus.networkinfo.getCurrentType() > 1) {
				//contentnomore = "上拉显示更多";
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						self.works.removeAll(); //先移除所有,防止视频已删除还保留
						var result = eval("(" + responseText + ")");
						self.works(result);
						self.worksLength(self.works().length);
						mui('#pullrefreshAll').pullRefresh().refresh(true); //重置上拉加载
					}
				});
			}
		}, 1500);

	}

	//上拉刷新pullupRefresh
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			//this.endPullUpToRefresh((++count > 2));
			page++;

			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result.length > 0) {
							self.works(self.works().concat(result));
							self.worksLength(self.works().length);
							if (result.length < common.gListPageSize) {
								mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(false);
							}
						} else {
							mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(true);
						}
					}
				});
			};
		}, 1500);
	};
	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}


	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("WorksDetails.html", false, {
			works: data
		}, false, false)
	}

	mui.plusReady(function() {
		self.getWorks();
		
	});

	window.addEventListener('refreshwoks', function(event) {
		console.log(11);
		self.works().forEach(function(item) {
			var tmp = common.clone(item);
			if (item.ID == event.detail.worksId) {
				tmp.LikeCount = event.detail.LikeCount;
				self.works.replace(item, tmp);
			}
		});
	});
	window.addEventListener('refreshAllworks', function(event) {
		if (event.detail.worksStatus) {
			self.works().forEach(function(item) {
				if (item.ID == event.detail.worksId) {
					self.works.remove(item);
				}
			});
		}
	});
}
ko.applyBindings(classmateWorks);