var recharge = function() {
	var self = this;
	var ID, orderID = 0;
	
	self.payList = ko.observableArray([]);
	self.balance = ko.observable();
	self.price = ko.observable();
	self.targetID = ko.observable(0);
	
	self.getPayList = function() {
		var url = common.gServerUrl + 'Common/TbPay/PayList';
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.payList(result);
			}
		})
	};
	
	self.toPay = function() {
		ID = this.ID;
		self.price(this.AmountInFact);
		mui('#middlePopover').popover("show");
	}
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}
	
	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}
	
	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
				common.showCurrentWebview();
			},
			error: function(){
				common.showCurrentWebview();
			}
		});
	}
	
	//支付
	self.gotoPay = function() {

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else if (self.PayType() == 'balance') {
			paytype = 4;
		} else {
			paytype = 3;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();
		var ajaxUrl = common.gServerUrl + "API/TbPay/UserPayBalance?payId=" + ID + "&payType=" + paytype;
		if( orderID !== 0 ) {
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + orderID + '&payType=' + paytype;
		}
		//新增则保存下载信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			success: function(responseText) { //responseText为微信支付所需的json
				var ret = JSON.parse(responseText);
				var orderID = ret.orderID;
				if (ret.requestJson == '') { //无需网上支付，报名成功
					mui.toast("已成功支付");
					plus.nativeUI.closeWaiting();
					common.refreshMyValue({
						valueType: 'balance',
					})
					mui('#middlePopover').popover("toggle");
					common.refreshOrder();//刷新订单
					mui.back();
				} else {
					var requestJson = JSON.stringify(ret.requestJson);

					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						//plus的pay有可能在微信支付成功的同步返回时，并未返回tradeno
						if(tradeno == '' || typeof tradeno == 'undefined'){
							plus.nativeUI.closeWaiting();
							mui('#middlePopover').popover("toggle");
							mui.back();
							return;
						}
						
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id=' + orderID + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								plus.nativeUI.closeWaiting();
								common.refreshMyValue({
									valueType: 'balance',
								})
								mui('#middlePopover').popover("toggle");
								common.refreshOrder();//刷新订单
								mui.back();
							},
							error: function() {
								common.setEnabled(evt);
								plus.nativeUI.closeWaiting();
							}
						})
					}, function() {
						common.setEnabled(evt);
						plus.nativeUI.closeWaiting();
					});
				}
			},
			error: function() {
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		})
	}
	
	 mui.plusReady(function(){
	 	var web = plus.webview.currentWebview();
		if (typeof(web.order) !== "undefined") {
			orderID = web.order.ID;
			self.targetID(web.order.TargetID);
		}
		self.getPayList();
	 	self.getBalance();
	 });
	
	mui.init({
		beforeback: function() {
			var my = plus.webview.currentWebview().opener();
			common.refreshMyValue({
				valueType: 'balance',
			});
			return true;
		}
	})
};

ko.applyBindings(recharge);
