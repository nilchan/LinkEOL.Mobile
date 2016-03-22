var teacherAuth = function() {
	var self = this;
	self.IDAuthStatus = ko.observable(""); //身份认证状态
	self.EduAuthStatus = ko.observable(""); //学历认证状态
	self.ProTitleAuthStatus = ko.observable(""); //职称认证状态

	self.IDAuth = ko.observable({}); //身份认证信息
	self.EduAuth = ko.observable({}); //学历认证信息
	self.ProTitleAuth = ko.observable({}); //职称认证信息
	self.myAuths = ko.observableArray([]);
	self.approvedID = ko.observable("");
	
	self.initData = function() {
		mui.ajax(common.gServerUrl + "API/TeacherAuth?userId=" + getLocalItem('UserID'), {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.myAuths(responseText);
				self.myAuths().forEach(function(item) {
					switch (item.AuthType) {
						case common.gDictTeacherAuthType.IDAuth:
							self.IDAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
							self.IDAuth(item);
							break;
						case common.gDictTeacherAuthType.EduAuth:
							self.EduAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
							self.EduAuth(item);
							break;
						case common.gDictTeacherAuthType.ProTitleAuth:
							self.ProTitleAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
							self.ProTitleAuth(item);
							break;
					}
				})
				if (self.IDAuthStatus() == '') self.IDAuthStatus('未认证');
				if (self.EduAuthStatus() == '') self.EduAuthStatus('未认证');
				if (self.ProTitleAuthStatus() == '') self.ProTitleAuthStatus('未认证');
				
				common.showCurrentWebview();
			}
		})
	}
	
	self.goauthID = function() {
		common.transfer('authID.html', true, {
			data: self.IDAuth(),
		});
	}
	self.goauthEdu = function() {
		common.transfer('authEdu.html', true, {
			data: self.EduAuth()
		});
	}
	self.goauthPro = function() {
		common.transfer('authProTitle.html', true, {
			data: self.ProTitleAuth()
		});
	}
	mui.plusReady(function() {
		/*var myInfo = plus.webview.currentWebview();
		if (typeof(myInfo.authMessage) !== "undefined") {
			self.myAuths(myInfo.authMessage);
			self.authManage(self.myAuths());
		}*/
		self.initData();
	});
	window.addEventListener('refreshEdu', function(event) {
		var ret = event.detail.EduAuth;
		
		if(ret && ret.PicPath){
			self.EduAuthStatus(common.getAuthStatusStr(ret.Approved, ret.PicPath));
			self.EduAuth(ret);
		}
	})
	window.addEventListener('refreshID', function(event) {
		var ret = event.detail.IDAuth;
		
		if(ret && ret.PicPath){
			self.IDAuthStatus(common.getAuthStatusStr(ret.Approved, ret.PicPath));
			self.IDAuth(ret);
			self.approvedID(ret.Approved);
		}
	})
	window.addEventListener('refreshPro', function(event) {
		var ret = event.detail.ProAuth;
		
		if(ret && ret.PicPath){
			self.ProTitleAuthStatus(common.getAuthStatusStr(ret.Approved, ret.PicPath));
			self.ProTitleAuth(ret);
		}
	})
	mui.init({
		beforeback: function() {
			var arrRet = [];
			arrRet.push(self.IDAuth());
			arrRet.push(self.EduAuth());
			arrRet.push(self.ProTitleAuth());
			var teacherAuth = plus.webview.currentWebview().opener();
			mui.fire(teacherAuth, 'refreshAuth', {
				auths: arrRet
			});
			return true
		}
	})
}
ko.applyBindings(teacherAuth);