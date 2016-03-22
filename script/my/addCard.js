var addCard = function() {
	var self = this;
	self.CardNumnber = ko.observable(''); //银行卡号
	self.bankDes = ko.observable(''); //银行卡所属-银行卡类型
	self.DepositBank = ko.observable(''); //开户支行
	self.OwnerName = ko.observable(''); //持卡人姓名
	self.bankName=ko.observable('');//银行卡名称
	self.bankCardType=ko.observable('');//银行卡类型
	self.isEsistBank=ko.observable(false);//是否存在该银行卡
	var cardResult;
	self.checkBanknunmber = function() {
		if (common.StrIsNull(self.CardNumnber()) == "") {
			mui.toast("请输入银行卡号");
		} else if (!/^(\d{16}|\d{19})$/.test(self.CardNumnber())) {
			mui.toast("请输入16位或19位银行卡号");
		}

		var bankDes = common.getMateBank(self.CardNumnber());
		self.bankDes(bankDes);
		if(common.StrIsNull(bankDes)==''){
			self.isEsistBank(true);
		}
	}
	self.addBank = function() {
		if (common.StrIsNull(self.CardNumnber()) == "") {
			mui.toast("请输入银行卡号");
			return;
		} else if (!/^(\d{16}|\d{19})$/.test(self.CardNumnber())) {
			mui.toast("请输入16位或19位银行卡号");
			return;
		}
		if (common.StrIsNull(self.OwnerName()) == "") {
			mui.toast("请输入持卡人姓名");
			return;
		}
		if (common.StrIsNull(self.bankName()) == "" && self.isEsistBank()) {
			mui.toast("请输入银行卡名称");
			return;
		}
		if (common.StrIsNull(self.bankCardType()) == "" && self.isEsistBank()) {
			mui.toast("请输入银行卡类型");
			return;
		}
		
		if(common.StrIsNull(self.bankCardType()) != "" && common.StrIsNull(self.bankName()) != ""){
			self.bankDes(self.bankCardType()+self.bankName());
		}

		var ajaxurl = common.gServerUrl + "API/UserCard";
		mui.ajax(ajaxurl, {
			type: "POST",
			data: {
				UserID: getLocalItem("UserID"),
				DepositBank: self.bankDes() + "," + self.DepositBank(),
				CardNumber: self.CardNumnber(),
				OwnerName: self.OwnerName()
			},
			success: function(responseText) {
				cardResult = eval("(" + responseText + ")");
				mui.toast("添加成功，正在返回...");
				mui.back();
			}
		})
	}
	mui.init({
		beforeback: function() {
			var myCard = plus.webview.currentWebview().opener();
			mui.fire(myCard, 'refreshCard', {
				bankcard: cardResult
			})
			return true;
		}
	})
}
ko.applyBindings(addCard);