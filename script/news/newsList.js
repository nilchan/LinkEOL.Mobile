var informationList = function() {
	var self = this;
	
	
	var url = common.gServerUrl + 'API/News/GetAPPNewsList';
	var pageID = 1;
	
	self.newsList = ko.observableArray([]); //列表数组
	
	//获取资讯列表
	self.getNewsList = function() {
		mui.ajax(url, {
			type: 'GET',
			success: function(responsText) {
				self.newsList(JSON.parse(responsText));
				self.clampText();
				common.showCurrentWebview();
			}
		});
	};
	
	//限制行数
	self.clampText = function() {
		var intros = document.getElementsByClassName('informationList-h3');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}
	
	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
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
	
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			pageID = 1;
			mui.ajax(url + '?pageIndex=' + pageID, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.newsList(result);
					self.clampText();
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();

					if (result && result.length > 0) {
						if (result.length >= common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
						}
					}
				}
			});
		}, 1500);
	}

	function pullupRefresh() {
		setTimeout(function() {
			pageID++;
			mui.ajax(url + '?pageIndex=' + pageID, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.newsList(self.newsList().concat(result));
					if (result && result.length > 0) {
						self.clampText();
						if (result.length < common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
					}
				}
			});
		}, 1500);
	};
	
	//跳转详情
	self.gotoInformationDetail = function(data) {
		common.transfer('newsDetail.html',false,{
			newsId:data.ID
		},false,false);
	}
	

	
	//跳转发布资讯
	self.gotoAddInformation = function() {
		common.transfer('addNews.html', true);
	}
	//跳转个人信息
	self.gotoInfo = function() {
		var user = this;
		if (user.UserType == common.gDictUserType.teacher) {
			common.transfer('../../modules/teacher/teacherInfo.html', false, {
				teacherID: user.PublisherUserID
			}, false, false);
		} else if (user.UserType == common.gDictUserType.student) {
			common.transfer('../../modules/student/studentInfo.html', false, {
				studentID: user.PublisherUserID
			}, false, false);
		}
	}
	
	window.addEventListener("refreshNews", function(event) {
		self.getNewsList();
	});
	
	self.getNewsList();
};

ko.applyBindings(informationList);
