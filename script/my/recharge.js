var recharge = function() {
	var self = this;
	var ID, orderID = 0, orderError = true;
	
	self.payList = ko.observableArray([]);
	self.selectedTips = ko.observableArray([]);
	self.balance = ko.observable();
	self.price = ko.observable();
	self.targetID = ko.observable(0);
	
	self.getPayList = function() {
		var url = common.gServerUrl + 'Common/Recharge/PayList';
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				var hasThePay = false;
				
				result.forEach(function(item){
					item.selected = ko.observable(false);
					self.payList.push(item);
					
					if(self.targetID() != 0 && self.targetID() == item.ID){
						self.clickOne(item);	//选中订单对应的套餐
						hasThePay = true;
					}
				});
				if(self.payList().length > 0 && self.targetID() == 0){	//非订单跳转，选中第一个
					//self.payList()[0].selected(true);
					self.clickOne(self.payList()[0]);
				}
				
				if( self.targetID() != 0 && !hasThePay) {
					alert('该订单的充值套餐已失效！');
					mui.back();
					return;
				}
			}
		})
	};
	
	self.clickOne = function(data){
		data.selected(true);
		self.payList().forEach(function(item){
			if(item != data)
				item.selected(false);
		})
		if(common.StrIsNull(data.Tips) == ''){
			self.selectedTips([]);
		}
		else{
			var arr = data.Tips.split(',');
			self.selectedTips(arr);
		}
		self.selectedTips.unshift('到账余额'+data.Amount+'元');
	}
	
	self.toPay = function() {
		var data = null;
		self.payList().forEach(function(item){
			if(item.selected() == true){
				data = item;
			}
		})
		if(data == null) return;
		
		ID = data.ID;
		self.price(data.AmountInFact);
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
