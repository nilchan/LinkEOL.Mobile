var myAttention = function() {
	var self = this;
	self.AttentionList = ko.observableArray([]); //关注我的用户列表
	self.FavUsers = ko.observableArray([]); //我关注的用户列表（老师或学生）
	self.PageWorks = ko.observable(1); //作品页码
	self.PageSize = ko.observable(9999); //请求数量
	self.Photo = ko.observable('../../images/my-default.png'); //头像路径
	self.UserID = ko.observable(getLocalItem("UserID"));
	mui.plusReady(function() {
		var self = this;
		//关注我的人
		var attentedUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId=" + self.UserID();
		mui.ajax(attentedUrl, {
			type: 'GET',
			success: function(responseText) {
				var attented = JSON.parse(responseText);
				self.AttentionList(attented);
				common.showCurrentWebview();
			}
		});

		//我关注的人
		var ajaxUrl = common.gServerUrl + 'API/Action?userid=' + self.UserID() + '&targetType=' + common.gDictActionTargetType.User + '&pageSize=' + self.PageSize();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var favUsers = JSON.parse(responseText);
				self.FavUsers(favUsers);
			}
		})
	})

	self.gotoUserInfo = function() { //用户详情
		var user = this;
		if (user.UserType == common.gDictUserType.teacher) {
			common.transfer('../../modules/teacher/teacherInfo.html', false, {
				teacherID: user.ID
			}, false, false);
		} else if (user.UserType == common.gDictUserType.student) {
			common.transfer('../../modules/student/studentInfo.html', false, {
				studentID: user.ID
			}, false, false);
		}

	}

	self.gotoWorkInfo = function() { //作品详情
		common.transfer("../works/WorksDetails.html", false, {
			works: this
		}, false, false);
	}

	self.qrcodeEvent = function() { //扫一扫
		if (self.UserID() > 0) {
			//qrcodeEvent.show();
			//common.transfer("qrcode.html", false, {}, false, true);
			common.transfer("qrcodeEvent.html", false, {}, false, false);
		} else {
			mui.toast("亲~登录后才能扫一扫哦")
		}
	}

	mui.init({
		beforeback: function() {
			var pp = plus.webview.getWebviewById('modules/my/my.html');
			mui.fire(pp, 'refreshAttention', {
				UserFavCount: self.FavUsers().length
			});
			return true;
		}
	})

	//刷新我的关注
	window.addEventListener('refreshAttention', function(event) {
		if (typeof event.detail.userInfo != 'undefined') {
			var isExist = true;
			self.FavUsers().forEach(function(item) {
				if (item.ID == event.detail.userInfo.UserID) {
					isExist = false;
				}
			})
			if (isExist) {
				self.FavUsers.push(event.detail.userInfo);
			}

		}
	})
}
ko.applyBindings(myAttention);