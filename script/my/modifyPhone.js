var modifyPhone = function() {
	var self = this;

	self.Password = ko.observable(""); //密码
	self.NewUserName = ko.observable(""); //新的手机号
	self.VerifyCode = ko.observable(""); //验证码
	self.RemainTime = ko.observable(0); //验证码剩余等待时间

	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		if (self.NewUserName() == "") {
			mui.toast('手机号不能为空');
		} else if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(self.NewUserName()))) {
			mui.toast("手机号码不合法")
		} else {
			//账号是否存在,此处不存在success
			self.RemainTime(common.gVarWaitingSeconds);
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.NewUserName() + "&exists=false", {
				type: 'GET',
				success: function(responseText) {
					mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.NewUserName(), {
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
				},
				error: function() {
					self.RemainTime(0);
				}
			})
		}
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
	self.saveUserNeme = function() {
		//保存修改手机号
		if (self.NewUserName() == "") {
			mui.toast('新手机号不能为空');
		}
		if (self.VerifyCode() == "") {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.Password() == "") {
			mui.toast('密码不能为空');
			return;
		}
		mui.ajax(common.gServerUrl + "API/Account/SetAccount", {
			type: 'POST',
			data: {
				ID: getLocalItem("UserID"),
				UserName: self.NewUserName(),
				Password: self.Password(),
				VerifyCode: self.VerifyCode()
			},
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				setLocalItem("UserName", result.UserName);
				setLocalItem("Token", result.Token);

				mui.toast("修改成功");
				mui.back();
			}
		});
	}
	mui.init({
		beforeback: function() {
			var parent = plus.webview.currentWebview().opener();
			mui.fire(parent, 'refreshUserName');
			return true;
		}
	});
}
ko.applyBindings(modifyPhone);