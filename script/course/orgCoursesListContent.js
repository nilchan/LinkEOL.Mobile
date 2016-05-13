var orgCoursesListContent = function() {
	var self = this;
	var page = 1;
	self.orgId = ko.observable(0);
	self.coursesList = ko.observableArray([]);

	mui.init({
		//刷新控件
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
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefresh').pullRefresh().refresh(true);
			page = 1; //重新加载第1页
			self.getCoursesList(function(responseText) {
				var result = JSON.parse(responseText);
				self.coursesList(result)
			});
		}, 1500);
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			page++;
			self.getCoursesList(function(responseText) {
				if (responseText && responseText.length > 0) {
					var result = JSON.parse(responseText);
					self.coursesList(self.coursesList().concat(result));
					if (responseText.length < common.gListPageSize) {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
					}
				} else {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
				}
			});

		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	self.clampDes = function() {
		var intros = document.getElementsByClassName('orgCourseList-introduction');
		var introsLen = intros.length;
		for (var i = 0; i < introsLen; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	//获取列表
	self.getCoursesList = function(callback) {
		var ajaxUrl = common.gServerUrl + '/API/Org/OrgCourseAPPList?orgId=' + self.orgId() + '&page=' + page;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				callback(responseText);

			}
		})
	}

	//跳转详情
	self.gotoDetail = function(data) {
		common.transfer("orgCourseInfo.html", false, {
			cid: data.ID
		}, false, false);
	}

	mui.plusReady(function() {
		self.getCoursesList(function(responseText) {
			if (responseText && responseText.length > 0) {
				var result = JSON.parse(responseText);
				self.coursesList(result);
				self.clampDes();
				if (responseText.length < common.gListPageSize) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				} else {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
				}
			} else {
				mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
			}

			common.showCurrentWebview();
		});
	});
}
ko.applyBindings(orgCoursesListContent);