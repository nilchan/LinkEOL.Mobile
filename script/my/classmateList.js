var viewModel = function() {
	var self = this;
	self.classmateListArray = ko.observableArray([]); //同学列表
	var page = 1;
	var userId = getLocalItem('UserID');
	self.classmateListLength = ko.observable(1);
	self.classmateText = ko.observable('你还没有授课老师，现在去设置吧');
	self.isHaveTeacher = ko.observable(false);

	var shareUrl = common.gWebsiteUrl; //分享附上的链接，为公司主页
	var shareTitle = "我就知道你喜欢学音乐" //分享内容的标题
	var shareContent = "学音乐的那点事"; //分享的内容*/
	var shareImg = "";

	var ul = document.getElementById("recommendArray");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			plus.nativeUI.showWaiting();
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg,common.gShareContentType.recommend);
		};
	}

	self.clampText = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	//跳转个人信息
	self.gotoInfo = function() {
		var user = this;
		if (user.UserType == common.gDictUserType.teacher) {
			common.transfer('../teacher/teacherInfo.html', false, {
				teacherID: user.UserID
			}, false, false);
		} else if (user.UserType == common.gDictUserType.student) {
			common.transfer('../student/studentInfo.html', false, {
				studentID: user.UserID
			}, false, false);
		}
	}
	
	//获取同学列表
	self.getClasamateList = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var result = JSON.parse(responseText);
				self.classmateListArray(result);
				//console.log(JSON.stringify(self.classmateListArray()));
				self.classmateListLength(self.classmateListArray().length);
				self.getInstruct();
				common.showCurrentWebview();
			}
		})
	};

	//获取授课设置
	self.getInstruct = function() {
		var thisUrl = common.gServerUrl + 'API/TeacherToStudent/IsTeacherOrClassMate?UserID=' + userId + '&Type=' + common.gIsHaveInstructType.isHaveTeacher;
		mui.ajax(thisUrl, {
			type: 'GET',
			success: function(responseText) {
				self.isHaveTeacher(responseText);
				self.classmateText = ko.observable('还没有其他同学呢，现在邀请他们过来吧');
			}
		})
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
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			page = 1;
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						self.classmateListArray.removeAll(); //先移除所有,防止视频已删除还保留
						var result = eval("(" + responseText + ")");
						self.classmateListArray(result);
						self.classmateListLength(self.classmateListArray().length);
						mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
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
							self.classmateListArray(self.classmateListArray().concat(result));
							self.classmateListLength(self.classmateListArray().length);
							if (result.length < common.gListPageSize) {
								mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
							}
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						}
					}
				});
			};
		}, 1500);
	};

	//重置上拉
	function refreshPull() {
		mui('#pullrefresh').pullRefresh().refresh(true);
		//mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//获取同学列表的url
	self.getAjaxUrl = function() {
		var thisUrl = common.gServerUrl + "API/TeacherToStudent/ClassMateUserList";
		thisUrl += '?UserID=' + userId;
		thisUrl += '&page=' + page;
		return thisUrl;
	}

	//跳转至授课老师列表页
	self.goMyTeacherList = function() {
		common.transfer('myTeacherList.html', true);
	}
	//mui('#popSort').popover('toggle');
	mui.plusReady(function() {
		Share.updateSerivces();
		self.getClasamateList();
	});
};

ko.applyBindings(viewModel);