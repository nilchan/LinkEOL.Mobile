var myAccount = function() {
	var self = this;
	self.Photo = ko.observable('');
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.bankCardNum = ko.observable(0); //银行卡数量
	self.AccountBalance = ko.observable();
	self.WeixinAPP = ko.observable('');
	self.AliPay = ko.observable('');

	self.goMyOrders = function() { //订单
		common.transfer('myOrders.html', true, {
			Photo: self.Photo()
		});
	}
	self.goMyIncoming = function() { //收入管理(以前的'我的账户')
		common.transfer('myIncoming.html', true, {
			Photo: self.Photo()
		}, false, true);
	}
	self.goAccountDetails = function() { //收支明细
		common.transfer('accountDetailsHeader.html', true, {}, false, true);
	}
	self.goBankList = function() { //银行卡管理
		common.transfer("myCard.html", true);
	}
	self.goRecharge = function() {
		common.transfer('recharge.html', true);
	}
	self.goDraw = function() {
		common.transfer('draw.html', true, {}, false, false);
	}

	//支付宝绑定
	self.bindingAli = function() {
		common.transfer('alipay.html', true, {
			ailpay: self.AliPay()
		});
	}

	self.getBalance = function() {
		mui.ajax(common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID'), {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.AccountBalance((result.Amount).toFixed(2));
			}
		})
	}

	var serviceWeixin = null;

	//获取所有第三方服务
	self.getOAuthServices = function() {
		plus.oauth.getServices(function(arr) {
			arr.forEach(function(item) {
				if (item.id == 'weixin') {
					serviceWeixin = item;
					return;
				}
			})
		})
	}

	// 注销所有授权登录认证服务
	function authLogout() {
		if (serviceWeixin.authResult) {
			serviceWeixin.logout(function(e) {
				self.WeixinAPP('');
				var url = common.gServerUrl + "API/User/AccountUnBundling?type=1";
				mui.ajax(url, {
					type: "PUT",
					success: function(responseText) {
						mui.toast('已成功解除绑定！');
						plus.nativeUI.closeWaiting();
					},
					error: function() {
						plus.nativeUI.closeWaiting();
					}
				});

			}, function(e) {
				alert("解除绑定失败，请稍后再试！");
			});
		}
	}

	//绑定微信
	self.bindingWeixin = function() {
		if (serviceWeixin == null) {
			mui.toast('请确认是否已安装微信');
			return;
		}
		if (!serviceWeixin.authResult) {
			var evt = event;
			if (!common.setDisabled()) return;

			plus.nativeUI.showWaiting();
			serviceWeixin.login(function(event) {
					if (event.target && event.target.authResult) {
						if (self.WeixinAPP() !== '') {
							var btnArray = ['确认', '取消'];
							mui.confirm('已绑定微信，是否解绑？', '解除绑定', btnArray, function(e) {
								if (e.index == 0) {
									authLogout();
									return;
								} else {
									plus.nativeUI.closeWaiting();
									return;
								}
							});
							return;
						}
						var info = event.target.authResult;
						var openid = info.openid;
						var url = common.gServerUrl + "API/User/AccountBinding?type=1&content=" + openid;
						mui.ajax(url, {
							type: "PUT",
							success: function(responseText) {
								mui.toast('已成功绑定微信');
								self.WeixinAPP(info.openid);
								common.setEnabled(evt);
								plus.nativeUI.closeWaiting();

							},
							error: function() {
								common.setEnabled(evt);
								plus.nativeUI.closeWaiting();
							}
						});
					} else {
						mui.toast('绑定失败，请稍后再试');
					}
				}, function(ex) {
					mui.toast('绑定失败，请稍后再试');
					common.setEnabled(evt);
					plus.nativeUI.closeWaiting();
				}) // 授权获取用户信息
		} else {
			if (self.WeixinAPP() !== '') {
				var btnArray = ['确认', '取消'];
				mui.confirm('已绑定微信，是否解绑？', '解除绑定', btnArray, function(e) {
					if (e.index == 0) {
						authLogout();
						return;
					} else {
						plus.nativeUI.closeWaiting();
						return;
					}
				});
				return;
			}
		}
	}

	mui.plusReady(function() {
		var thisWebview = plus.webview.currentWebview();
		if (common.StrIsNull(thisWebview.Photo) != "") {
			self.Photo(thisWebview.Photo);
		}
		if (typeof(thisWebview.bankCardNum) != "undefined") {
			self.bankCardNum(thisWebview.bankCardNum);
		}
		if (typeof(thisWebview.WeixinAPP) != "undefined") {
			self.WeixinAPP(thisWebview.WeixinAPP);
		}
		if (typeof(thisWebview.AliPay) != "undefined") {
			self.AliPay(thisWebview.AliPay);
			//console.log(self.AliPay());
		}
		self.getBalance();
		self.getOAuthServices();
	})

	//刷新银行卡数量
	window.addEventListener('refeshBankCardNum', function(event) {
		//console.log(event.detail.bankCardNum);
		if (common.StrIsNull(event.detail.bankCardNum) != '') {
			self.bankCardNum(event.detail.bankCardNum);
		}
	});

	//刷新余额
	window.addEventListener('refeshBalance', function(event) {
		self.getBalance();
	});
	
	//刷新支付宝状态
	window.addEventListener('refeshAli', function(event) {
		if(typeof event.detail.alipay=='undefined'){
			self.AliPay('');
		}else{
			self.AliPay(event.detail.alipay);
		}
		
	});

	mui.init({
		beforeback: function() {
			var my = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(my));
			common.refreshMyValue({
				valueType: 'balance',
			});
			return true;
		}
	})

}
ko.applyBindings(myAccount);