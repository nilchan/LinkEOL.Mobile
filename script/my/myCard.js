var myCard = function() {
	var self = this;
	var userID = getLocalItem("UserID");
	self.bankName = ko.observable('');
	self.bankCardtype = ko.observable('');
	self.CardNo = ko.observable('');
	self.IsDefault = ko.observable(false);
	self.bankcardArray = ko.observableArray([]);
	self.addBankcard = function() {
		common.transfer("addCard.html", false);
	}
	self.getBankcard = function() {
		var ajaxurl = common.gServerUrl + "API/UserCard?userId=";
		mui.ajax(ajaxurl + userID, {
			type: "GET",
			success: function(responseText) {
				//console.log(responseText);
				var bankcard = eval("(" + responseText + ")");
				self.bankcardArray(bankcard);
			}
		})
	}
	self.setDefault = function() {
		var thisCard = this;
		if (thisCard.IsDefault) {
			mui.toast("已经为默认银行卡");
		} else {
			mui.ajax(common.gServerUrl + "/API/UserCard/SetDefault?id=" + thisCard.ID + "&userId=" + userID, {
				type: 'PUT',
				success: function(responseText) {
					/*self.bankcardArray.removeAll();
					self.getBankcard();*/
					var arr = [];
					self.bankcardArray().forEach(function(item) {
						if (thisCard.ID != item.ID) {
							item.IsDefault = false;
						} else {
							item.IsDefault = true;
						}
						arr.push(item);
					})
					self.bankcardArray.removeAll();
					self.bankcardArray(arr);
					mui.toast("设置默认成功");
				}
			});
		}
	}
	window.addEventListener("refreshCard", function(event) {
		if (common.StrIsNull(event.detail.bankcard) != "") {
			self.bankcardArray(self.bankcardArray().concat(event.detail.bankcard));
		}
	})

	mui.plusReady(function() {
		self.getBankcard();
	})
	
	mui.init({
		gestureConfig: {
			longtap: true
		},
		beforeback: function() {
			var myAccount = plus.webview.currentWebview().opener();
			mui.fire(myAccount, 'refeshBankCardNum', {
				bankCardNum: self.bankcardArray().length
			})
			return true;
		}
	})
}
ko.applyBindings(myCard);