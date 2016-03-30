var studentInfo = function() {
	var self = this;
	var sUserID; //学生UserID，需从上一个页面传递而得
	var page = 1;
	self.isFav = ko.observable(false);
	self.collectionStatus = ko.observable(""); //关注
	self.userInfo = ko.observableArray([]);
	self.works = ko.observableArray([]);
	var UserId = getLocalItem('UserID');
	self.getStudentInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + sUserID + "&usertype=" + common.gDictUserType.student, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.userInfo(result);
				common.showCurrentWebview();
			}
		})
	};

	self.getWorks = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + sUserID + "&page=" + page, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			}
		})
	};

	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("../works/WorksDetails.html", false, {
			works: data
		}, false, false)
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			page++;
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(common.gServerUrl + "API/Work?userID=" + sUserID + "&page=" + page, {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result && result.length > 0) {
							self.works(self.works().concat(result));
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

			};
		}, 1500)
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//关注
	self.Fav = function() {
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能关注~")
			return;
		}

		if (self.isFav() == true) { //取消关注
			var ret = common.deleteAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, sUserID, UserId);
			if (ret) {
				self.isFav(false);
				self.collectionStatus('');
				mui.toast('成功取消关注');
				var myWebview = plus.webview.getWebviewById('modules/my/my.html');
				mui.fire(myWebview, 'getAttention');
			}
		} else {
			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, sUserID);
			if (ret) {
				self.isFav(true);
				self.collectionStatus('teacheeInfo-sc-after');
				mui.toast('关注成功');
				var myWebview = plus.webview.getWebviewById('modules/my/my.html');
				mui.fire(myWebview, 'getAttention');
			}
		}

	}

	//跳转至咨询
	self.goUserNews = function() {
		common.transfer('../news/myNewsList.html', false, {
			userid: sUserID,
			useName:self.userInfo().DisplayName
		}, false, false);
	}

	mui.plusReady(function() {
		var currentWeb = plus.webview.currentWebview();
		if (common.StrIsNull(currentWeb.studentID) != "") {
			sUserID = currentWeb.studentID;
		}
		self.getStudentInfo();
		self.getWorks();

		common.getActions(common.gDictActionType.Favorite, common.gDictActionTargetType.User, sUserID, function(result) {
			if (common.StrIsNull(result) != '') {
				var arr = JSON.parse(result);
				for (var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if (item.UserID.toString() != getLocalItem("UserID") ||
						item.TargetType.toString() != common.gDictActionTargetType.User ||
						item.TargetID.toString() != sUserID) {
						continue;
					}
					if (item.ActionType.toString() == common.gDictActionType.Favorite) {
						self.collectionStatus('teacheeInfo-sc-after');
						self.isFav(true);
					}
				}
			}
		});
	})

	//初始化界面
	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});
}
ko.applyBindings(studentInfo);