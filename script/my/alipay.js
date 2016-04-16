var alipay = function() {
	var self = this;
	self.aliAccount = ko.observable('');
	self.bandStatus = ko.observable(false); //未绑定
	var alipayId=document.getElementById('alipayId');
	
	self.bandAccount = function() {
		var myAccount=plus.webview.currentWebview().opener();
		if (self.bandStatus()) {
			var ajaxUrl=common.gServerUrl+'API/User/AccountUnBundling?type='+common.gPayType[1].text;
			mui.ajax(ajaxUrl, {
				type: 'PUT',
				success: function(responseText) {
					mui.toast('解除绑定支付宝成功');
					self.bandStatus(false);
					mui.fire(myAccount,'refeshAli',{
					});
					self.aliAccount('');
					//mui.back();
					alipayId.readOnly='';
				}
			});
		} else {
			if(common.StrIsNull(self.aliAccount())==''){
				mui.toast('请输入支付宝账号');
				return ;
			}
			var ajaxUrl = common.gServerUrl + 'API/User/AccountBinding?type=' + common.gPayType[1].text + '&content=' + self.aliAccount();
			mui.ajax(ajaxUrl, {
				type: 'PUT',
				success: function(responseText) {
					alipayId.readOnly='readonly';
					mui.toast('绑定支付宝成功');
					self.bandStatus(true);
					mui.fire(myAccount,'refeshAli',{
						alipay:self.aliAccount()
					});
					mui.back();
				}
			});
		}
	}

	mui.plusReady(function() {
		var thisWeb = plus.webview.currentWebview();
		if (thisWeb.ailpay !='') {
			self.aliAccount(thisWeb.ailpay);
			self.bandStatus(true);
			alipayId.readOnly='readonly';
		}
		
	})
}
ko.applyBindings(alipay);