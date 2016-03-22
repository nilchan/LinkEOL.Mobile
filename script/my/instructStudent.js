var viewModel = function() {
	var self = this;
	self.instructedArray = ko.observableArray([]); //授课关系列表
	self.isGetStudent = ko.observable(''); //老师是否查看授课学生，是为查看学生，否为查看老师
	self.displayCheck = ko.observable(false); //是否选择
	self.isGiving = ko.observable(false); //是否有赠送权限
	self.givingCheck = ko.observable(false); //选择赠送还是催作业

	var userId = getLocalItem('UserID');
	var pageID = 1;
	self.instructLength = ko.observable(1);

	//分享功能
	var shareUrl = common.gWebsiteUrl; //分享附上的链接，为公司主页
	var shareTitle = "我就知道你喜欢学音乐" //分享内容的标题
	var shareContent = "学音乐的那点事"; //分享的内容*/
	var shareImg = "";

	var ul = document.getElementById("recommendArray");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg);
		};
	}

	//行数字数限制
	self.clampText = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	//判断老师是否有赠送金额权限
	self.getTeacherInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + userId + "&usertype=" + getLocalItem('UserType'), {
			type: 'GET',
			success: function(responseText) {
				if (JSON.parse(responseText).IsGiving == true) {
					self.isGiving(true);
				}
			}
		})
	}

	//选择赠送
	self.selectGiving = function() {
		self.displayCheck(true);
		self.givingCheck(true);
	}

	//选择学生
	self.selectStudent = function() {
		self.displayCheck(true);
	}

	//取消选择
	self.cacelSelect = function() {
		self.displayCheck(false);
		self.givingCheck(false);
		for (i in self.instructedArray()) {
			self.instructedArray()[i].selected(false);
		}
	}

	//选择学生
	self.clickOne = function(data) {
		if (self.displayCheck() === false) return;
		if (data.selected()) {
			data.selected(false);
		} else {
			data.selected(true);
		}
	};

	//提醒交作业
	self.remindStudent = function() {
		var sID = [];
		for (i in self.instructedArray()) {
			if (self.instructedArray()[i].selected()) {
				sID.push(self.instructedArray()[i].info.StudentUserID);
			}
		}
		if (sID.length === 0) {
			mui.toast("请至少选择一位学生！");
			return;
		}
		plus.nativeUI.showWaiting();
		var url = common.gServerUrl + 'Common/Work/RemindsAddHomeWork?TeacherID=' + userId;
		mui.ajax(url, {
			type: 'POST',
			contentType: "application/json",
			data: JSON.stringify(sID),
			success: function(responsText) {
				mui.toast('操作成功');
				self.cacelSelect();
				plus.nativeUI.closeWaiting();
			}
		});
	}

	//赠送金额
	self.givingMoney = function() {
		var sID = [];
		for (i in self.instructedArray()) {
			if (self.instructedArray()[i].selected()) {
				sID.push(self.instructedArray()[i].info.StudentUserID);
			}
		}
		if (sID.length === 0) {
			mui.toast("请至少选择一位学生！");
			return;
		}
		plus.nativeUI.showWaiting();
		var url = common.gServerUrl + 'API/AccountDetails/TeacherGivingStudentMoney?TeacherID=' + userId;
		mui.ajax(url, {
			type: 'POST',
			contentType: "application/json",
			data: JSON.stringify(sID),
			success: function(responsText) {
				mui.toast('操作成功');
				self.cacelSelect();
				self.getIntructList();
				
			}
		});
	}

	//提交选择
	self.submitSelect = function() {
		if (self.givingCheck()) { //赠送金额
			self.givingMoney();
		} else { //交作业
			self.remindStudent();
		}
	}

	//获取授课学生列表
	self.getIntructList = function() {
		var thisUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?TeacherID=" + userId + '&page=' + pageID;
		mui.ajax(thisUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.instructedArray([]);
				result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.instructedArray.push(obj);
					})
					//console.log(JSON.stringify(self.instructedArray()));
				self.instructLength(self.instructedArray().length);
				plus.nativeUI.closeWaiting();
				common.showCurrentWebview();
			}
		})
	};

	//添加授课学生
	self.addInstructStudent = function() {
		var tmpID = [];
		self.instructedArray().forEach(function(item) {
			tmpID.push(item.StudentUserID);
		});
		common.transfer('teacherToStudentAdd.html', true, {
			studentID: tmpID
		});
	}

	//删除授课学生
	self.removeStudent = function(data) {
		mui.confirm('是否解除与' + data.info.DisplayName + '的授课关系', '', ['是', '否'], function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + 'API/TeacherToStudent/DelStudent?TeacherToStudentID=' + data.info.TeacherToStudentID, {
					type: 'DELETE',
					success: function(responseText) {
						mui.toast("解除成功~");
						self.instructedArray.remove(data);
					}
				});
			}
		})
	}

	//跳转至授课学生详情
	self.goStudentDeteil = function(data) {
		var detailUrl = '../teacher/teacherInfo.html';
		var dataArray = {
			teacherID: data.info.ID
		}
		if (data.info.UserType == common.gDictUserType.student) {
			detailUrl = '../student/studentInfo.html';
			dataArray['studentID'] = data.info.ID
		}
		common.transfer(detailUrl, true, dataArray, false, false);
	}

	//同意授课
	self.agreeStudent = function(data) {
		var url = common.gServerUrl + '/API/TeacherToStudent/TeacherIsStudent?TeacherToStudentID=' + data.info.TeacherToStudentID + '&IsConfirm=true';
		mui.ajax(url, {
			type: 'PUT',
			success: function(responsText) {
				mui.toast('操作成功');
				self.getIntructList();
			}
		});
	}

	//拒绝授课
	self.refuseStudent = function(data) {
		var url = common.gServerUrl + '/API/TeacherToStudent/TeacherIsStudent?TeacherToStudentID=' + data.info.TeacherToStudentID + '&IsConfirm=false';
		mui.ajax(url, {
			type: 'PUT',
			success: function(responsText) {
				mui.toast('操作成功');
				self.getIntructList();
			}
		});
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			/*down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},*/
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});

	//下拉刷新
	/*function pulldownRefresh() {
		setTimeout(function() {
			//pageID++;
			pageID = 1;

			var resultUrl = 

			mui.ajax(resultUrl, {
				type: 'GET',
				success: function(responseText) {
					if (responseText === "") {
						refreshFlag = false;
					}
					var result = eval("(" + responseText + ")");
					self.geIntructList([]);
					result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.geIntructList.push(obj);
					})
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
	}*/

	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			//mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageID++;
			var resultUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?TeacherID=" + userId + '&page=' + pageID;;

			mui.ajax(resultUrl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");

					if (result && result.length > 0) {
						self.instructedArray(self.instructedArray().concat(result));
						self.instructLength(self.instructedArray().length);
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

	//获取授课学生列表的url
	self.getAjaxUrl = function() {
		var thisUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList";
		thisUrl += '?TeacherID=' + userId;
		return thisUrl;
	}



	//获取授课学生
	self.setIsConfirm = function(data) {
		var confirmUrl = common.gServerUrl + 'API/TeacherToStudent/TeacherIsStudent?TeacherToStudentID=' + data.info.TeacherToStudentID + '&IsConfirm=' + isConfirm;
		mui.ajax(confirmUrl, {
			type: 'PUT',
			success: function() {
				mui.toast('成功通过了' + data.info.DisplayName + '学生的申请');
			}
		})
	}

	self.qrcodeEvent = function() { //扫一扫
		if (userId > 0) {
			common.transfer("qrcodeEvent.html", false, {}, false, false);
		} else {
			mui.toast("亲~登录后才能扫一扫哦")
		}
	}

	//mui('#popSort').popover('toggle');
	mui.plusReady(function() {
		self.getTeacherInfo();
		var thisWeb = plus.webview.currentWebview();
		if (typeof thisWeb.isGetStudent != 'undefined') {
			self.isGetStudent(thisWeb.isGetStudent);
		}
		Share.updateSerivces();

		self.getIntructList();
	});
};

ko.applyBindings(viewModel);