var addCard = function() {
	var self = this;
	var userID = getLocalItem("UserID");
	self.CardNumber = ko.observable(''); //银行卡号
	self.bankDes = ko.observable(''); //银行卡所属-银行卡类型
	self.DepositBank = ko.observable(''); //开户支行
	self.OwnerName = ko.observable(''); //持卡人姓名
	self.bankName=ko.observable('');//银行卡名称
	self.bankCardType=ko.observable('');//银行卡类型
	self.isExistBank=ko.observable(true);//是否存在该银行
	self.bankcardArray = ko.observableArray([]);
	var cardResult;
	
	self.getBankList=function(){
		var ajaxurl = common.gServerUrl + "API/UserCard?userId=";
		mui.ajax(ajaxurl + userID, {
			type: "GET",
			success: function(responseText) {
				var bankcard = eval("(" + responseText + ")");
				self.bankcardArray(bankcard);
				//console.log(JSON.stringify(self.bankcardArray()));
			}
		})
	}
	
	self.checkBanknunmber = function() {
		if (common.StrIsNull(self.CardNumber()) == "") {
			mui.toast("请输入银行卡号");
		} else if (!/^(\d{16}|\d{19})$/.test(self.CardNumber())) {
			mui.toast("请输入16位或19位银行卡号");
		}else{
			self.bankcardArray().forEach(function(item){
				if(item.CardNumber==self.CardNumber()){
					mui.toast('该卡号已存在');
					return;
				}
			})
		}

		var bankDes = common.getMateBank(self.CardNumber());
		self.bankDes(bankDes);
		if(self.CardNumber() == '' || common.StrIsNull(bankDes)!=''){
			self.isExistBank(true);
		}
		else{
			self.isExistBank(false);
		}
	}
	self.addBank = function() {
		var _existCard = false;
		if (common.StrIsNull(self.CardNumber()) == "") {
			mui.toast("请输入银行卡号");
			return;
		} else if (!/^(\d{16}|\d{19})$/.test(self.CardNumber())) {
			mui.toast("请输入16位或19位银行卡号");
			return;
		} else{
			self.bankcardArray().forEach(function(item){
				if(item.CardNumber==self.CardNumber()){
					_existCard = true;
					return ;
				}
			});
		}
		if(_existCard){
			mui.toast('该卡号已存在');
			return ;
		}
		if (common.StrIsNull(self.OwnerName()) == "") {
			mui.toast("请输入持卡人姓名");
			return;
		}
		if (common.StrIsNull(self.DepositBank()) == "") {
			mui.toast("请输入开户行");
			return;
		}
		if (common.StrIsNull(self.bankName()) == "" && self.isExistBank() == false) {
			mui.toast("请输入银行卡名称");
			return;
		}
		if (common.StrIsNull(self.bankCardType()) == "" && self.isExistBank() == false) {
			mui.toast("请输入银行卡类型");
			return;
		}
		
		if(common.StrIsNull(self.bankCardType()) != "" && common.StrIsNull(self.bankName()) != ""){
			self.bankDes(self.bankCardType()+'-'+self.bankName());
		}

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();
		var ajaxurl = common.gServerUrl + "API/UserCard";
		mui.ajax(ajaxurl, {
			type: "POST",
			data: {
				UserID: getLocalItem("UserID"),
				DepositBank: self.bankDes() + "," + self.DepositBank(),
				CardNumber: self.CardNumber(),
				OwnerName: self.OwnerName()
			},
			success: function(responseText) {
				cardResult = eval("(" + responseText + ")");
				mui.toast("添加成功，正在返回...");
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
				mui.back();
			},
			error: function(){
				common.setEnabled(evt);
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
	
	mui.plusReady(function(){
		self.getBankList();
	})
}
ko.applyBindings(addCard);