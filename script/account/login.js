var login = function() {
	var self = this;
	var ID;
	self.UserName = ko.observable('');
	self.Password = ko.observable('');

	//登录
	self.checkLogin = function() {
		if (self.UserName() == "") {
			mui.toast("用户名不能为空");
			return;
		}
		if (self.Password() == "") {
			mui.toast("密码不能为空");
			return;
		}

		//var info = plus.push.getClientInfo();
		//var ajaxUrl = common.gServerUrl + "Common/Login?devicetoken=" + info.token + "&clientid=" + info.clientid;
		var ajaxUrl = common.gServerUrl + "Common/Login";
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: "POST",
			data: {
				UserName: self.UserName(),
				Password: self.Password()
			},
			success: function(responseText) {
				plus.nativeUI.showWaiting();
				var result = responseText;
				//console.log(JSON.stringify(result));
				setLocalItem("UserID", result.UserID);
				setLocalItem("UserName", result.UserName);
				setLocalItem("DisplayName", result.DisplayName);
				setLocalItem("Token", result.Token);
				setLocalItem("UserType", result.UserType);
				if(result.SubjectID !='')
					setLocalItem("SubjectID", result.SubjectID);
				var prevPageID = getLocalItem(common.gVarLocalPageIDBeforeLogin);
				var prevPage = plus.webview.getWebviewById(prevPageID);
				var isIndex = true; //是否一级页面登录
				if (prevPageID && prevPage) {
					isIndex = common.isIndexChild(prevPageID);
				}

				var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
				mui.toast("登录成功...");

				if (isIndex) {
					plus.webview.close(index); //关闭首页webview
					common.transfer("../../index.html", false, {}, true, false, "indexID");
				} else {
					//plus.nativeUI.showWaiting();
					for (var i = index.children().length - 1; i >= 0; i--) {
						if (index.children()[i].id == common.gIndexChildren[0].webviewId || index.children()[i].id == common.gIndexChildren[1].webviewId) continue;
						index.children()[i].reload();
					}
					mui.back();
					plus.nativeUI.closeWaiting();
				}
			}
		});
	}

	//注册页面
	self.registerUser = function() {
		common.transfer('register.html', false, {
			aid: ID
		})
	}

	//忘记密码
	self.forgetpw = function() {
		mui.openWindow({
			url: "../my/forgetPassword.html",
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			}
		})
	}
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if ( typeof(web.aid) !== "undefined" ) {
			ID = web.aid;
		}
		//plus.statistic.eventTrig('95060701','checkLogin');
	})
}
ko.applyBindings(login);