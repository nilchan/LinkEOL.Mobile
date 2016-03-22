var moreInfo = function() {
	var self = this;
	self.VerifyCode = ko.observable(""); //验证码
	self.Password = ko.observable(""); //原密码
	self.newPassword = ko.observable(""); //新密码
	self.ConPassword = ko.observable(""); //确认密码
	var UserName = getLocalItem('UserName'); //手机号
	var UserID = getLocalItem('UserID'); //用户id
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.feedBackText = ko.observable(""); //意见反馈文本
	self.version = ko.observable(getLocalItem('Version.Local'));

	/*更多页面 js
	 */
	self.goHelp=function(){
		common.transfer('../home/userGuide.html', false);
	}
	self.goChangePassword = function() {
		//跳转到修改密码页面
		common.transfer('changePassword.html', true)
	}
	self.goFeedback = function() {
		//跳转到意见反馈页面
		common.transfer('feedBack.html')
	}
	self.goAboutUs = function() {
		//跳转到关于我们页面
		common.transfer('aboutUs.html')
			//common.transfer("../exam/examNotice.html");
	}
	self.goRecommendFriends = function() {
		//跳转到推荐好友页面
		common.transfer('recommendFriends.html');
	}
	self.goIntructTeacherList = function() { //授课老师页面
		common.transfer('myTeacherList.html', true, {
			isGetStudent: false
		}, false, false);
	}
	self.quitLogin = function() {
		//退出登录
		if (getLocalItem('UserID') < 0 || getLocalItem('UserID') == "") {
			mui.toast("没有登录哦");
		} else {
			removeLocalItem('UserID');
			removeLocalItem('UserName');
			removeLocalItem('Token');
			removeLocalItem('UserType');
			removeLocalItem('DisplayName');
			plus.storage.removeItem(common.getPageName() + '.SubjectName');
			plus.storage.removeItem(common.getPageName() + '.SubjectID');
			plus.storage.removeItem(common.getPageName() + '.WorkTypeName');
			plus.storage.removeItem(common.getPageName() + '.WorkTypeID');
			plus.storage.removeItem(common.getPageName() + '.DisplayName');

			var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
			plus.webview.close(index);
			mui.toast("注销成功, 正在返回...");
			common.transfer("../../index.html", false, {}, true, false, "indexID");
		}
	}

	//获取验证码
	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		self.RemainTime(common.gVarWaitingSeconds);
		//获取验证码
		mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + UserName, {
			//dataType:'json',
			type: 'GET',
			success: function(responseText) {
				//var result = eval("(" + responseText + ")");
				mui.toast(responseText);
				self.CheckTime();
			},
			error: function() {
				self.RemainTime(0);
			}
		})
	}
	self.CheckTime = function() {
		//验证码计时器
		if (self.RemainTime() == 0) {
			return;
		} else {
			self.RemainTime(self.RemainTime() - 1);
			setTimeout(function() {
				self.CheckTime()
			}, 1000);
		}
	}

	//保存密码
	self.saveNewPassword = function() {
		if (self.VerifyCode() == "") {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.Password() == "") {
			mui.toast('原密码不能为空');
			return;
		}
		if (self.newPassword() == "") {
			mui.toast('新密码不能为空');
			return;
		}
		if (self.newPassword() != self.ConPassword()) {
			mui.toast('请输入一致密码');
			return;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		mui.ajax(common.gServerUrl + "Common/Account/SetPassword", {
			type: 'POST',
			data: {
				ID: UserID,
				Password: self.Password(),
				NewPassword: self.newPassword(),
				VerifyCode: self.VerifyCode()
			},
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				setLocalItem("Token", result.Token);
				mui.toast("修改成功");
				mui.back();
				//common.transfer('moreInfo.html');
			},
			error: function() {
				common.setEnabled(evt);
			}
		});
	}

	//意见反馈
	self.feedBackSub = function() {
		//console.log(UserID<0 || common.StrIsNull(UserID) == "");
		if (UserID < 0 || common.StrIsNull(UserID) == "") {
			mui.toast("您还没登录~~");
			return;
		}
		if (self.feedBackText() == "") {
			mui.toast("请您先写下对我们的宝贵建议~~");
		} else {
			var evt = event;
			if (!common.setDisabled()) return;

			mui.ajax(common.gServerUrl + "API/Feedback", {
				type: 'POST',
				data: {
					UserID: UserID,
					ContentText: self.feedBackText()
				},
				success: function(responseText) {
					mui.toast("提交成功，感谢你的宝贵建议，祝您天天开心");
					mui.back();
				},
				error: function() {
					common.setEnabled(evt);
				}
			})
		}
	}
	window.addEventListener("refreshAuth", function(event) {//刷新认证
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

}
ko.applyBindings(moreInfo);