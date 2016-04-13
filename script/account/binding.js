var binding = function() {
	var self = this;

	var serviceWeixin = null;

	//获取所有第三方服务
	self.getOAuthServices = function() {
		plus.oauth.getServices(function(arr){
			arr.forEach(function(item){
				if(item.id=='weixin'){
					serviceWeixin = item;
					return;
				}
			})
		})
	}

	//绑定微信
	self.bindingWeixin = function() {
		if(serviceWeixin == null){
			mui.toast('请确认是否已安装微信');
			return;
		}
		
		if(!serviceWeixin.authResult){
			var evt = event;
			if (!common.setDisabled()) return;
			
			plus.nativeUI.showWaiting();
			serviceWeixin.login(function(event){
				if(event.target && event.target.userInfo){
					var info = event.target.userInfo;
					var sex = info.sex;
					var nickname = info.nickname;
					var unionid = info.unionid;
					var openid = info.openid;
					var headimgurl = info.headimgurl;
					var province = info.province;
					var city = info.city;
					
					mui.ajax(common.gServerUrl + "The URL to be finished.", {
						dataType: 'json',
						type: "GET",
						data: {
							Gender: sex,
							DisplayName: nickname,
							WeixinOpen: openid,
							UnionID: unionid,
							Photo: headimgurl
						},
						success: function(responseText) {
							mui.toast('已成功绑定微信');
							common.setEnabled(evt);
							plus.nativeUI.closeWaiting();
						},
						error: function(){
							common.setEnabled(evt);
							plus.nativeUI.closeWaiting();
						}
					});
				}
			}, function(ex){
				mui.toast('绑定失败，请稍后再试');
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			})   // 授权获取用户信息
		}
	}
	
	mui.plusReady(function() {
		self.getOAuthServices();
	})
}
ko.applyBindings(binding);