var myAccount = function() {
	var self = this;
	self.Photo = ko.observable('');
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.bankCardNum = ko.observable(0); //银行卡数量

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
		common.transfer("myCard.html", false);
	}
	mui.plusReady(function() {
		var thisWebview = plus.webview.currentWebview();
		if (common.StrIsNull(thisWebview.Photo) != "") {
			self.Photo(thisWebview.Photo);
		}
		if (typeof(thisWebview.bankCardNum) != "undefined") {
			self.bankCardNum(thisWebview.bankCardNum);
		}
	})
	
	//刷新银行卡数量
	window.addEventListener('refeshBankCardNum',function(event){
		//console.log(event.detail.bankCardNum);
		if(common.StrIsNull(event.detail.bankCardNum)!=''){
			self.bankCardNum(event.detail.bankCardNum);
		}
	})
	
	mui.init({
		beforeback: function() {
			var my = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(my));
			mui.fire(my, 'refreshAccount', {
				bankCardNum: self.bankCardNum()
			})
			return true;
		}
	})

}
ko.applyBindings(myAccount);