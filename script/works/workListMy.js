var workListMy = function() {
	var self = this;

	var authorID = 0; //作品拥有者
	var page = 1;

	self.isAuthor = ko.observable(false);
	self.workDes = ko.observable("作品");
	self.worksList = ko.observableArray([]);

	mui.init({
		pullRefresh: {
			container: '#pullrefreshMy',
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

	/**
	 * 根据作品实例对象返回用于显示的视图模型
	 * @param {Object} worksObj 作品实例
	 */
	var worksItem = function(worksObj) {
		var self = this;
		self.works = worksObj;
		self.VideoThumbnail = ko.observable(worksObj.VideoThumbnail);
		self.IsFinish = ko.observable(worksObj.IsFinish); //专门用ko变量记录，便于更新
		self.UploadedSize = ko.observable(0);
		self.TotalSize = ko.observable(0);
		self.UploadTask = null;
		self.Percentage = ko.computed(function() {
			return self.TotalSize() == 0 ? '0%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		});
	}

	self.getAjaxUrl = function() {
		var curl = "?userID=" + authorID + "&page=" + page;
		return common.gServerUrl + "API/Work" + curl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.worksList.removeAll(); //先移除所有
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var obj = new worksItem(item);
						self.worksList.push(obj);
						//console.log(obj.VideoThumbnail());
					})
					mui('#pullrefreshMy').pullRefresh().refresh(true); //重置上拉加载

					common.showCurrentWebview();
				} else {
					common.showCurrentWebview();
				}
			},
			error: function() {
				common.showCurrentWebview();
			}
		});
	};

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			page = 1; //重新加载第1页
			self.getWorks();
		}, 1500);
	}

	//上拉加载
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			page++;
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result && result.length > 0) {
							result.forEach(function(item) {
								var obj = new worksItem(item);
								self.worksList.push(obj);
							})
							if (result.length < common.gListPageSize) {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(false); //false代表还有数据
							}
						} else {
							mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
						}

						/*if (self.worksList().length < common.gListPageSize) {
							mui('#pullrefreshMy').pullRefresh().disablePullupToRefresh();	//禁用上拉刷新
						} else {
							mui('#pullrefreshMy').pullRefresh().enablePullupToRefresh();	//启用上拉刷新
						}*/

					}
				});
			}
		}, 1500)
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
		common.transfer("../works/WorksDetails.html", false, {
			works: data.works
		}, false, false)
	}

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		authorID = getLocalItem("UserID"); //默认获取自己的作品
		if (typeof(web.teacherID) !== "undefined") {
			authorID = web.teacherID;
			self.displayCheck(web.displayCheck);
		}
		if (getLocalItem("UserType") == common.gDictUserType.student) {
			self.workDes("作业");
		}
		if (getLocalItem("teacherID") != "") {
			authorID = getLocalItem("teacherID");
		}
		self.isAuthor(authorID == getLocalItem("UserID"));

		//plus.storage.clear();
		self.getWorks();
	});

	//添加作品
	self.gotoAddWorks = function() {
		common.transfer("addWorks.html", true, {});
	};

	window.addEventListener("refreshMyworks", function(event) {
		if (event.detail.worksStatus) {
			self.worksList().forEach(function(item) {
				if (item.works.ID == event.detail.worksId) {
					self.worksList.remove(item);
				}
			});
		}
	});


}
ko.applyBindings(workListMy);