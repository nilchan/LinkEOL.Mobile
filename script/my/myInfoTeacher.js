var my_teacher = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('');
	self.Photo = ko.observable('');
	self.FavCount = ko.observable(0);
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.Score = ko.observable(0); //老师得分
	self.PhotoCount=ko.observable(0);
	self.auths = ko.observableArray([]); //认证数组
	self.IDAuthApproved = ko.observable(0);
	self.goMyUserAttented = function() {
		common.transfer('myAttended.html', true, {}, true);
	}
	self.goMyinfo = function() {
		common.transfer('myInfo.html', true, {}, true, false);
	}
	self.goMoreInfo = function() {
		common.transfer('moreInfo.html', false, {}, true);
	}
	self.goAuth = function() {
		common.transfer('teacherAuth.html', true, {
			authMessage: self.auths()
		});
	}
	self.goMyAccount = function() {
		common.transfer('myAccount.html', true, {
			Photo: self.Photo()
		}, true);
	}
	self.goMessageList = function() {
		common.transfer('messageList.html', true);
	}
	self.goMyAttention = function() {
		common.transfer('myAttention.html', true);
	}
	self.goMyAlbum = function() {
		common.transfer('myAlbum.html', true);
	}
	self.goHelp = function() {
		common.transfer('../my/help.html', false);
	}

	self.gototest = function() {
		common.transfer('test.html?id=' + self.UserID(), false);
	}
	
	self.qrcodeEvent = function() {
		if (self.UserID() > 0) {
			common.transfer("qrcode.html", false, {}, false, true);
		} else {
			mui.toast("亲~，登录后才能扫一扫")
		}
	}

	self.getStudent = function() {
		var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				self.ID(responseText.ID);
				self.DisplayName(responseText.DisplayName);
				if (responseText.Photo)
					self.Photo(common.getPhotoUrl(responseText.Photo));
				self.FavCount(responseText.FavCount);
				if (responseText.Score)
					self.Score(responseText.Score);
				if (self.DisplayName() == "请登录") {
					mui.toast('还没完善信息哦，点击头像完善信息，马上就去~', '信息不完整', self.goMyinfo());
				}
			}
		})
	}

	self.getMyAuth = function() {
		mui.ajax(common.gServerUrl + "API/TeacherAuth?userId=" + getLocalItem('UserID'), {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.auths(responseText);
				if (responseText && responseText.length > 0) {
					responseText.forEach(function(item) {
						switch (item.AuthType) {
							case common.gDictTeacherAuthType.IDAuth:
								self.IDAuthApproved(item.Approved);
								break;
						}
					});
				}
			}
		})
	}

	mui.plusReady(function() {
		if (self.UserID() > 0) {
			self.getStudent();
			self.getMyAuth();
		}
	})

	window.addEventListener('refreshAttend', function(event) {
		self.FavCount(event.detail.myAttendNum);
	});
	window.addEventListener('refreshMyinfo', function(event) {
		if (event.detail.userScore != "") {
			self.Score(event.detail.userScore);
		}
		if (event.detail.displayName != "") {
			self.DisplayName(event.detail.displayName);
		}
		if (event.detail.imgPath != "") {
			self.Photo(event.detail.imgPath);
		}
	});
	window.addEventListener("refreshAuth", function(event) {
		if (event.detail.auths && event.detail.auths.length > 0) {
			self.auths(event.detail.auths);
			self.auths().forEach(function(item) {
				switch (item.AuthType) {
					case common.gDictTeacherAuthType.IDAuth:
						self.IDAuthApproved(item.Approved);
						break;
				}
			});
		}
	});
	mui.back = function() {
		var qrp = document.getElementById("qrcodePopover");
		if (qrp.className.indexOf("mui-active") > 0) {
			mui('#qrcodePopover').popover('toggle');
		} else {
			common.confirmQuit();
		}

	}
}
ko.applyBindings(my_teacher);

var qrcode = new QRCode(document.getElementById("qrcode"), {
	width: 200, //设置宽高
	height: 200
});

qrcode.makeCode(common.gWebsiteUrl + 'modules/teacher/teacherInfo.html?id=' + self.UserID());