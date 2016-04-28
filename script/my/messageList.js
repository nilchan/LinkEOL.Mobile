//knockoutjs
var message_notification = function() {
	var self = this;
	self.messages = ko.observableArray([]);
	var pageNum = 1;
	var receiverId = getLocalItem("UserID");
	self.messageLength = ko.observable(1);
	self.isEdit = ko.observable(false); //是否编辑
	var thisWeb;
	//获取消息
	self.getMessage = function() {
		plus.runtime.setBadgeNumber(0);
		mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				self.messages([]);
				responseText.forEach(function(item) {
					item['ischeckout'] = ko.observable(false);
					item['canTransfer'] = ko.observable(self.canJump(item.ModuleID, item.MsgUrl));
					self.messages.push(item);
				})
				self.messageLength(self.messages().length);
				mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
				if (responseText.length > 0)
					setLocalItem("msgLastTime", responseText[responseText.length - 1].SendTime);
				

			}
		})
	}

	//删除消息
	self.removeMessages = function() {
		var message = this;
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Message/" + message.ID, {
					type: 'DELETE',
					success: function(responseText) {
						self.messages.remove(message);
					}
				});
			}
		});
	}

	/**
	 * 判断是否可跳转
	 * @param {Number} msgModule	消息模块ID
	 * @param {String} msgUrl		消息链接
	 * @return {Boolean}			可跳转则返回true，否则返回false
	 */
	self.canJump = function(msgModule, msgUrl) {
		switch (msgModule) {
			case common.gMessageModule.workDownloadModule:
			case common.gMessageModule.feedBackModule:
			case common.gMessageModule.activityModule:
				return false;
			case common.gMessageModule.instructModule:
			case common.gMessageModule.systemMessageModule:
			case common.gMessageModule.temp:
				return msgUrl != '';
			default:
				return true;
		}
	}

	//跳转到消息详情
	self.goMessagesDetail = function(data) {
		//console.log(data.ischeckout());
		if (self.isEdit()) {
			//处理选中
			if (data.ischeckout() == false) {
				//data['ischeckout']=ko.observable(true);
				data.ischeckout(true);
			} else {
				data.ischeckout(false);
			}
			return;
		}

		var message = this;
		/**
		 commentModule: 1, //点评
		 workDownloadModule: 2, //作品下载
		 courseModule: 3, //课程表
		 homeworkModule: 4, //作业
		 teacherAuthModule: 5, //老师认证
		 examModule: 6,        //考级报名
		 feedBackModule: 7, //新建页面跳转
		 systemMessageModule: 8, //系统通知
		 activityModule: 9,    //活动购票
		 instructModule: 10 //授课关系通知
		 accountModule: 11, //账户通知
		 submitHomeworkModule: 12, //交作业提醒
		 activityRegister: 13 //活动报名
		 */

		var readArray = [message.ID];
		mui.ajax(common.gServerUrl + 'API/Message/UpdateMsgRead', {
			type: 'PUT',
			contentType: "application/json",
			data: JSON.stringify(readArray),
			success: function(responseText) {
				self.messages().forEach(function(item) {
					var tmp = common.clone(item);
					if (item.ID == message.ID) {
						tmp.IsRead = true;
						self.messages.replace(item, tmp);
					}
				});
			}
		})

		if (!message.canTransfer()) {
			return;
		}

		if (message.ModuleID == common.gMessageModule.commentModule || message.ModuleID == common.gMessageModule.homeworkModule) { //1 or 4
			var ajaxurl = common.gServerUrl + "API/Comment/" + message.SourceID;
			mui.ajax(ajaxurl, {
				type: "GET",
				success: function(responseText) {
					console.log(responseText);
					var cmt = eval("(" + responseText + ")");
					if (cmt.CommenterID == getLocalItem('UserID')) { //点评者
						common.transfer("../comment/commentDetails.html", false, {
							teacherComment: cmt
						}, false, false);
					}

					if (cmt.AuthorID == getLocalItem('UserID')) { //被点评者
						var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + message.SourceID;
						mui.ajax(ajaxurl, {
							type: "GET",
							success: function(responseText) {
								var worksContent = eval("(" + responseText + ")");
								common.transfer("../works/WorksDetails.html", false, {
									works: worksContent
								}, false, false);
							}
						})
					}
				}
			})
		} else if (message.ModuleID == common.gMessageModule.workDownloadModule) { //2
			//common.transfer("../works/mydownloadHeader.html")
		} else if (message.ModuleID == common.gMessageModule.courseModule) { //3
			//common.showIndexWebview(2, false);
			common.transfer("../course/myCourse.html", true, {}, false, false);
			/*} else if (message.ModuleID == common.gMessageModule.homeworkModule) { //4
				if (getLocalItem('UserType') == common.gDictUserType.teacher) {
					common.transfer("../comment/commentListHeader.html", true, {
						MessageType: message.MessageType
					}, false, false);
				} else {
					common.transfer("../works/worksListMyHeader.html", true, common.extrasUp(1), false, false); //1为我的作业下标
				}*/
		} else if (message.ModuleID == common.gMessageModule.teacherAuthModule) { //5
			common.transfer('../my/teacherAuth.html', true, {}, false, false);
		} else if (message.ModuleID == common.gMessageModule.examModule) { //6
			common.transfer('../exam/examList.html', true);
		} else if (message.ModuleID == common.gMessageModule.feedBackModule) { //7

		} else if (message.ModuleID == common.gMessageModule.systemMessageModule) { //8
			message.MsgUrl = message.MsgUrl.indexOf("http://") >= 0 || message.MsgUrl.indexOf("https://") >= 0 ? message.MsgUrl : "http://" + message.MsgUrl;
			common.transfer("../home/messageWeb.html", false, {
				url: message.MsgUrl
			});
		} else if (message.ModuleID == common.gMessageModule.activityModule) { //9

		} else if (message.ModuleID == common.gMessageModule.instructModule) { //10
			if (common.StrIsNull(message.MsgUrl) == '') { //解除授课关系
				return;
			}
			if (message.MsgUrl.indexOf('Teacher') >= 0) {
				common.transfer('../my/myTeacherList.html', true, {}, false, false);
			} else if (message.MsgUrl.indexOf('Student') >= 0) {
				common.transfer('../my/myStudentList.html', true, {}, false, false);
			}
		} else if (message.ModuleID == common.gMessageModule.accountModule) { //11
			common.transfer('../my/accountDetailsHeader.html', true);
		} else if (message.ModuleID == common.gMessageModule.submitHomeworkModule) { //12
			common.transfer("../works/worksListMyHeader.html", true, {}, false, false);
		} else if (message.ModuleID == common.gMessageModule.activityRegister) { //13
			console.log(JSON.stringify(message));
			if (message.MsgUrl.indexOf('reggame') >= 0) {
				common.transfer('../activity/XSBRegister/apply.html', true, {
					rid: message.SourceID
				}, false, false);
			} else if (message.MsgUrl.indexOf('reglectures') >= 0) {
				common.transfer('../activity/teacherFTF/apply.html', true, {
					rid: message.SourceID
				}, false, false);
			}
		} else if (message.MsgUrl != null) {
			message.MsgUrl = message.MsgUrl.indexOf("http://") >= 0 ? message.MsgUrl : "http://" + message.MsgUrl;
			common.transfer("../home/messageWeb.html", false, {
				url: message.MsgUrl
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

	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefresh').pullRefresh().refresh(true);
			pageNum = 1; //重新加载第1页
			self.getMessage();
		}, 1500);
	}

	//var count = 0;
	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					if (responseText && responseText.length > 0) {
						responseText.forEach(function(item) {
							item['ischeckout'] = ko.observable(false);
							item['canTransfer'] = ko.observable(self.canJump(item.ModuleID, item.MsgUrl));
							//self.messages.push(item);
						})
						self.messages(self.messages().concat(responseText));
						self.messageLength(self.messages().length);
						if (responseText.length < common.gListPageSize) {
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
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//设置为已读
	self.setRead = function() {
		var readArrayID = [];
		var readArray = [];
		self.messages().forEach(function(item) {
			if (item.ischeckout()) {
				readArrayID.push(item.ID);
				readArray.push(item);
			}
		})
		if (readArrayID.length == 0) {
			mui.toast('请至少选中一条消息');
			return;
		}
		mui.ajax(common.gServerUrl + 'API/Message/UpdateMsgRead', {
			type: 'PUT',
			contentType: "application/json",
			data: JSON.stringify(readArrayID),
			success: function(responseText) {
				//self.messages([]);
				self.isEdit(false);
				mui.fire(thisWeb.opener(), 'refreshEdit');
				/*self.getMessage(function(){
					mui.toast('成功设置为已读');
				});*/
				for (var i = 0; i < self.messages().length; i++) {
					for (var a = 0; a < readArray.length; a++) {
						if (self.messages()[i].ID == readArray[a].ID) {
							//self.messages.remove(deleteArray[a]);
							var tmp = common.clone(self.messages()[i]);
							tmp.IsRead = true;
							self.messages.replace(self.messages()[i], tmp);

						}
					}
				}
				mui.toast('成功设置为已读');

			}
		})
	}

	//删除消息
	self.removeMess = function() {
		var deleteArrayID = [];
		var deleteArray = [];
		self.messages().forEach(function(item) {
			if (item.ischeckout()) {
				deleteArray.push(item);
				deleteArrayID.push(item.ID);
			}
		})
		if (deleteArrayID.length == 0) {
			mui.toast('请至少选中一条消息');
			return;
		}

		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + 'API/Message/Delete2', {
					type: 'DELETE',
					contentType: "application/json",
					data: JSON.stringify(deleteArrayID),
					success: function(responseText) {
						//self.messages([]);
						self.isEdit(false);
						mui.fire(thisWeb.opener(), 'refreshEdit');
						for (var i = 0; i < self.messages().length; i++) {
							for (var a = 0; a < deleteArray.length; a++) {
								if (self.messages()[i].ID == deleteArray[a].ID) {
									self.messages.remove(deleteArray[a]);
								}
							}
						}
						mui.toast('成功删除消息');

					}
				})
			}
		});

	}

	//监听是否可以编辑
	window.addEventListener('canEdit', function() {
		if (self.messages().length <= 0) {
			mui.fire(thisWeb.opener(), 'getCanEdit', {
				canEdit: false
			});
			mui.toast('没有消息可以编辑~');
		} else {
			mui.fire(thisWeb.opener(), 'getCanEdit', {
				canEdit: true
			});
		}
	});

	//监听编辑的状态
	window.addEventListener('editMess', function(event) {
		self.isEdit(event.detail.isStartEdit); //获取编辑状态
		//console.log(self.isEdit());
		self.messages().forEach(function(item) {
			item.ischeckout(false);
		})

	});

	//监听全选事件
	window.addEventListener('checkMess', function(event) {
		var isAllCheckout = event.detail.isAllCheckout
			//console.log(self.isEdit());
		if (isAllCheckout) {
			self.messages().forEach(function(item) {
				var tmp = common.clone(item);
				tmp.ischeckout(true);
				self.messages.replace(item, tmp);
			});
		} else {
			self.messages().forEach(function(item) {
				var tmp = common.clone(item);
				tmp.ischeckout(false);
				self.messages.replace(item, tmp);
			});
		}
	});

	mui.plusReady(function() {
		thisWeb = plus.webview.currentWebview();
		if (receiverId > 0) {
			self.getMessage();
		}

	});
}
ko.applyBindings(message_notification);