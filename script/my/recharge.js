var recharge = function() {
	var self = this;
	var ID, orderID = 0;
	
	self.payList = ko.observableArray([]);
	self.balance = ko.observable();
	self.price = ko.observable();
	self.targetID = ko.observable(0);
	
	self.getPayList = function() {
		var url = common.gServerUrl + 'Common/Recharge/PayList';
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
		var obj = {ID: ID};
		Pay.preparePay(JSON.stringify(obj), self.PayType(), common.gDictOrderTargetType.Recharge, 
			orderID, function(newOrderID){
				orderID = newOrderID;
			}, function(){
				mui.back();
			});
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
			var parentWeb = plus.webview.currentWebview().opener();
			common.refreshMyValue({
				valueType: 'balance',
			});
			mui.fire(parentWeb,'refeshBalance');
			return true;
		}
	})
};

ko.applyBindings(recharge);
