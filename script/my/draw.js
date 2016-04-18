var draw = function() {
	var self = this;
	var remark; //账户标记
	var userid = getLocalItem("UserID"); //用户id
	var account; //账户余额
	var UserPassword; //账户密码
	self.placeholderValue = ko.observable("当前余额0.00元");
	self.amount = ko.observable('');
	self.bankData = ko.observableArray([]); //银行数据
	self.aliData = ko.observableArray([]); //支付宝数据
	self.weixinData = ko.observableArray([]); //微信数据
	self.PayTypeData = ko.observableArray([]); //支付数据
	self.checkPayType = ko.observable(); //提现类型

	//选中样式
	var drawTypes = document.getElementsByClassName('drawType');
	for (var i = 0; i < drawTypes.length; i++) {
		drawTypes[i].onclick = function() {
			for (var i = 0; i < drawTypes.length; i++) {
				drawTypes[i].children[0].getElementsByTagName('em')[0].className = 'circle';
			}
			this.children[0].getElementsByTagName('em')[0].setAttribute('class', 'circle circle-cheacked');
			self.checkPayType(this.id);

		}
	}

	//账户余额
	self.getAmount = function() {
		mui.ajax(common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + userid, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				account = Number(result.Amount.toFixed(2));
				self.placeholderValue("当前余额" + account + "元");
			}
		})
	}

	//获取账户数据
	self.getDrawData = function() {
		var ajaxUrl = common.gServerUrl + 'API/AccountDetails/DrawMoneyTypeList';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(eval("(" + responseText + ")"));
				//console.log(JSON.stringify(result));
				self.PayTypeData(result);
				self.bankData(result[0]); //银行数据
				self.aliData(result[1]); //支付宝数据
				self.weixinData(result[2]); //微信数据
				common.showCurrentWebview();
			}
		})
	}

	//提现
	self.drawAccount = function() { //|| (!common.IsNum(self.amount())) || self.amount()>account
		if (self.amount() <= 0 || !common.IsNum(self.amount())) {
			mui.toast('请输入正确的提现金额');
			return;
		}
		if (Number(self.amount()) > account) {
			mui.toast('超出账户余额');
			return;
		}
		if (common.StrIsNull(self.checkPayType()) == '') {
			mui.toast('请选择一种提现方式');
			return;
		}
		var evt = event;
		if (!common.setDisabled()) return;

		common.gPayType.forEach(function(item) {
			if (item.value == self.checkPayType()) {
				self.PayTypeData().forEach(function(payItem) {
					if (payItem.PayType == item.text) {
						if (!payItem.Enabled) {
							mui.toast('还没绑定，请选择已绑定账户');
							common.setEnabled(evt);
						} else {
							plus.nativeUI.prompt('请输入登录密码', function(e) {
								if (e.index == 0) {
									UserPassword = e.value;
									remark = payItem.Remark;
									var drawAjax = common.gServerUrl + 'API/AccountDetails/DrawMoneyAdd?amount=' + self.amount() + '&remark=' + remark+'&pass='+UserPassword;
									mui.ajax(drawAjax, {
										type: 'GET',
										success: function(responseText) {
											var result = JSON.parse(responseText);
											mui.toast('成功提交提现申请，将在48小时内到账，请留意通知');
											common.refreshMyValue({
												valueType: 'balance',
											});
											self.getAmount();
											mui.back();
										},
										error: function() {
											common.setEnabled(evt);
										}
									});

								} else {
									common.setEnabled(evt);
									return;
								}
							}, '', '登录密码', ['确定', '取消']);

						}
					}
				})
			}
		});

	}

	mui.plusReady(function() {
		self.getAmount();
		self.getDrawData();
	});

	mui.init({
		beforeback: function() {
			var accountWeb = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(my));
			mui.fire(accountWeb, 'refeshBalance');
			return true;
		}
	});

}
ko.applyBindings(draw);