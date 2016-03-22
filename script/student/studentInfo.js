var studentInfo = function() {
	var self = this;
	var sUserID = 1932; //学生UserID，需从上一个页面传递而得
	var sUserType = 64; //学生用户类型
	var page = 1;
	self.userInfo = ko.observableArray([]);
	self.Photo = ko.observable("../../images/my-default.png"); //头像
	self.DisplayName = ko.observable(""); //姓名
	self.Gender = ko.observable("女"); //性别
	self.Years = ko.observable("0"); //年龄
	//self.Score = ko.observable("0"); //得分
	self.FavCount = ko.observable("0"); //关注
	self.works = ko.observableArray([]);

	self.getStudentInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + sUserID + "&usertype=" + sUserType, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				self.userInfo(result);
				self.Gender(common.gJsonGenderType[parseInt(result.Gender)].text)
				self.Years(result.Age);
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

	//赞
	self.Like = function() {
		var tmp = common.clone(this);
		//mui.toast(this.LikeCount);
		if (this.AuthorID == self.UserID) {
			mui.toast("作者本人不允许赞");
			return
		} else {
			var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, this.ID);
			if (ret) {
				tmp.LikeCount = tmp.LikeCount + 1;
				self.works.replace(this, tmp);
				mui.toast('感谢您的赞许');
			}
		}
	}

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
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, sUserID);
		if (ret) {
			self.FavCount(self.FavCount() + 1);
			mui.toast('关注成功');
			var myWebview=plus.webview.getWebviewById('modules/my/my.html');
			mui.fire(myWebview,'getAttention');
		}
	}
	mui.plusReady(function() {
		var currentWeb = plus.webview.currentWebview();
		if (common.StrIsNull(currentWeb.studentID) != "") {
			sUserID = currentWeb.studentID;
		}
		self.getStudentInfo();
		self.getWorks();
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