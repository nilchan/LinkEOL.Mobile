var myIncoming = function() {
	var self = this;
	self.DisplayName = ko.observable(""); //用户名
	self.Balance = ko.observable(0); //我的余额
	self.DetailsNotFinish = ko.observableArray([]); //未完成明细
	self.DetailsFinished = ko.observableArray([]); //已完成明细
	self.DetailsTrasfered = ko.observableArray([]); //已转账明细
	self.SumAccount = ko.observable('0'); //未完成小计
	self.Photo = ko.observable('');
	var userID = getLocalItem('UserID');
	var ajaxUrl = common.gServerUrl + 'API/AccountDetails/TeacherAccountDetailsList?UserID=' + userID + '&Type=';

	mui.plusReady(function() {
		var self = this;
		//获取个人信息
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + userID + "&usertype=" + getLocalItem('UserType'), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.DisplayName(result.DisplayName);
			}
		});

		//获取余额
		var BalanceUrl = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + userID;
		mui.ajax(BalanceUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.Balance((result.Amount).toFixed(2));
			}
		});
		var current = plus.webview.currentWebview();
		if (common.StrIsNull(current.Photo) != "") {
			self.Photo(current.Photo);
		}
		self.SumNotFinish();
	});

	//预收入
	self.SumNotFinish = function() {
		//common.gDictAccountDetailType.NotFinish;
		mui.ajax(ajaxUrl + common.gDictAccountDetailType.NotFinish, {
			type: 'GET',
			success: function(responseText) {
				var detailsNotFinish = JSON.parse(responseText);
				self.DetailsNotFinish(detailsNotFinish);
				self.SumAccount(common.getArraySum(self.DetailsNotFinish(), 'SettleMoney'));
				common.showCurrentWebview();
			}
		})
	}

	//已完成
	self.SumFinish = function() {
		mui.ajax(ajaxUrl + common.gDictAccountDetailType.Finished, {
			type: 'GET',
			success: function(responseText) {
				var detailsFinish = JSON.parse(responseText);
				self.DetailsFinished(detailsFinish);
				console.log(JSON.stringify(self.DetailsFinished()))
				self.SumAccount(common.getArraySum(self.DetailsFinished(), 'SettleMoney'));
			}
		})
	}

	//已到账
	self.SumTrasfered = function() {
		mui.ajax(ajaxUrl + common.gDictAccountDetailType.Transfered, {
			type: 'GET',
			success: function(responseText) {
				var detailsTrasfered = JSON.parse(responseText);
				self.DetailsTrasfered(detailsTrasfered);
				self.SumAccount(common.getArraySum(self.DetailsTrasfered(), 'SettleMoney'));
			}
		})
	}

	//提现
	self.Withdraw = function() {
		//mui.toast("敬请期待");
		common.transfer("myCard.html", false);
	}

	/*window.addEventListener('refeshBalance', function(event) {
		if (event.detail.newBalance) {
			self.Balance(event.detail.newBalance);
		}
	});*/

}
ko.applyBindings(myIncoming);