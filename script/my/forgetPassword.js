var forgotPassword = function() {
	var self = this;
	self.UserName = ko.observable(""); //注册的手机号
	self.VerifyCode = ko.observable(""); //验证码
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.NewPassword = ko.observable(""); //新密码
	self.CheckPassword = ko.observable(""); //重复新密码

	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		if (self.UserName() == "") {
			mui.toast('手机号不能为空');
		} else if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(self.UserName()))) {
			mui.toast("手机号码不合法")
		} else {
			//plus.nativeUI.showWaiting();
			//账号是否存在，此处为存在，exists默认为true
			self.RemainTime(common.gVarWaitingSeconds);
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName(), {
				type: 'GET',
				success: function(responseText) {
					mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.UserName(), {
						//dataType:'json',
						type: 'GET',
						success: function(responseText) {
							console.log(responseText);
							//var result = eval("(" + responseText + ")");

							self.CheckTime();
						},
						error: function() {
							self.RemainTime(0);
						}
					})
				},
				error: function() {
					self.RemainTime(0);
				}

			})
		}
	}

	//验证码计时器
	self.CheckTime = function() {
		if (self.RemainTime() == 0) {
			return;
		} else {
			self.RemainTime(self.RemainTime() - 1);
			setTimeout(function() {
				self.CheckTime()
			}, 1000);
		}
	}

	//确定按钮实现
	self.forgetPassword = function() {
		if (self.UserName() == "") {
			mui.toast('手机号不能为空');
			return;
		}
		if (self.VerifyCode() == "") {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.NewPassword() == "") {
			mui.toast('密码不能为空');
			return;
		}

		if (self.NewPassword() != self.CheckPassword()) {
			mui.toast('请输入一致密码');
			return;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		mui.ajax(common.gServerUrl + "API/Account/ForgotPassword", {
			type: 'POST',
			data: {
				UserName: self.UserName(),
				NewPassword: self.NewPassword(),
				VerifyCode: self.VerifyCode()
			},
			success: function(responseText) {
				mui.toast("密码重置成功");
				mui.openWindow({
					url: '../account/login.html',
					show: {
						autoShow: true,
						aniShow: "slide-in-right",
						duration: "100ms"
					},
					waiting: {
						autoShow: false
					}
				});
			},
			error: function(){
				common.setEnabled(evt);
			}
		});
	}

}
ko.applyBindings(forgotPassword);