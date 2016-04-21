var Pay = Pay || {};
var pays = {};

//检测是否安装支付服务
var checkServices = function(pc) {
	if (!pc.serviceReady) {
		var txt = null;
		switch (pc.id) {
			case "alipay":
				txt = "系统未安装“支付宝快捷支付”服务，无法完成支付，是否立即安装？";
				break;
			case "wxpay":
				txt = "系统未安装“" + pc.description + "”服务，无法完成支付，是否立即安装？";
				break;
			default:
				break;
		}
		plus.nativeUI.confirm(txt, function(e) {
			if (e.index == 0) {
				pc.installService();
			}
		}, pc.description);
	}
}

mui.plusReady(function() {
	plus.payment.getChannels(function(channels) {
		for (var i in channels) {
			var channel = channels[i];
			pays[channel.id] = channel;
			checkServices(channel);
		}
	}, function(e) {
		mui.toast("获取支付通道失败");
	})
})

//order：支付订单信息，由支付通道定义的数据格式，通常是由业务服务器生成或向支付服务器获取，是经过加密的字符串信息。
Pay.pay = function(payid, order, successCB, failureCB) {
	//order = '{"appid":"wx888888","noncestr":"5d318d9f064b4415b6db41340a17c1af","package":"Sign=WXPay","partnerid":"88888","prepayid":"wx9999999","timestamp":"1445653811","sign":"8888"}';
	//console.log(payid);
	//https://pay.weixin.qq.com/wiki/doc/api/app.php?chapter=8_5
	plus.payment.request(pays[payid], order, function(result) {
		mui.toast("支付成功");
		var tradeno = result.tradeno;
		if (typeof tradeno === 'undefined') {
			tradeno = '';
		}

		successCB(tradeno);
	}, function(e) {
		mui.toast("支付失败"); // + e.code);
		//console.log("["+e.code+"]："+e.message);
		failureCB();
	});
}

/**
 * 支付前准备支付所需的信息，如下订单、返回支付所需的信息
 * @param {String} targetJson			订单对应货品的json字符串
 * @param {String} payType				支付方式，wxpay-微信支付；alipay-支付宝支付；balance-余额支付
 * @param {Number} targetType			货品类型，见common.gDictOrderTargetType
 * @param {Number} orderId				原有订单号，新增订单时为0
 * @param {Function} successsOrderCB	下单成功后的回调
 * @param {Function} successPayCB		支付成功后的回调
 * @return {Boolean}					成功则返回true，否则返回false
 */
Pay.preparePay = function(targetJson, payType, targetType, orderId, successsOrderCB, successPayCB){
	if(!orderId) orderId = 0;
	
	//支付方式的数值
	var payTypeId = 0;
	switch(payType){
		case 'wxpay':
			payTypeId = 1;
			break;
		case 'alipay':
			payTypeId = 2;
			break;
		case 'balance':
			payTypeId = 4;
			break;
	}
	if (payTypeId <= 0) {
		mui.toast('请选择正确的支付方式');
		return false;
	}
	
	var evt = event;
	if (!common.setDisabled()) return;
	
	plus.nativeUI.showWaiting();
	var ajaxUrl = common.gServerUrl + "API/Order/SubmitOrder?payType=" + payTypeId + "&targetType=" + 
		targetType + "&orderId=" + orderId;
	
	//新增则保存下载信息；修改则保存新的支付方式。均返回订单信息
	mui.ajax(ajaxUrl, {
		type: 'POST',
		data: {"": targetJson},
		success: function(responseText) { //responseText为微信支付所需的json
			var ret = JSON.parse(responseText);
			var orderID = ret.orderID;
			successsOrderCB(orderID, ret.expireMinutes);
			if (ret.requestJson == '') { //无需网上支付，报名成功
				mui.toast("已成功支付");
				plus.nativeUI.closeWaiting();
				common.refreshMyValue({
					valueType: 'balance',
				});
				mui('#middlePopover').popover("toggle");
				common.refreshOrder();//刷新订单
				successPayCB();
			} else {
				var requestJson = '';
				if(self.PayType() == 'alipay')
					requestJson = ret.requestJson;
				else
					requestJson = JSON.stringify(ret.requestJson);
				alert(self.PayType() + ' ' + typeof requestJson + ' ' + requestJson);

				//根据支付方式、订单信息，调用支付操作
				Pay.pay(payType, requestJson, function(tradeno) { //成功后的回调函数
					//plus的pay有可能在微信支付成功的同步返回时，并未返回tradeno
					if(tradeno == '' || typeof tradeno == 'undefined'){
						plus.nativeUI.closeWaiting();
						mui('#middlePopover').popover("toggle");
						successPayCB();
						return true;
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
							successPayCB();
							return true;
						},
						error: function() {
							common.setEnabled(evt);
							plus.nativeUI.closeWaiting();
							return true;
						}
					})
				}, function() {
					common.setEnabled(evt);
					plus.nativeUI.closeWaiting();
					return false;
				});
			}
		},
		error: function() {
			common.setEnabled(evt);
			plus.nativeUI.closeWaiting();
			return false;
		}
	})
}

