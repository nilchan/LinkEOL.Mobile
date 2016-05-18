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
Pay.preparePay = function(targetJson, payType, targetType, orderId, successsOrderCB, successPayCB, failureCB) {
	if (!orderId) orderId = 0;

	//支付方式的数值
	var payTypeId = 0;
	switch (payType) {
		case 'wxpay':
			payTypeId = 1;
			break;
		case 'alipay':
			payTypeId = 2;
			break;
		case 'balance':
			payTypeId = 4;
			break;
		case 'free':
			payTypeId = 6;
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
		data: {
			"": targetJson
		},
		success: function(responseText) { //responseText为微信支付所需的json
			var ret = JSON.parse(responseText);
			var orderID = ret.orderID;
			successsOrderCB(orderID, ret.expireMinutes);
			if (ret.requestJson == '') { //无需网上支付，报名成功
				mui.toast("操作成功");
				plus.nativeUI.closeWaiting();
				common.refreshMyValue({
					valueType: 'balance',
				});
				//mui('#middlePopover').popover("hide");
				common.refreshOrder(); //刷新订单
				successPayCB();
			} else {
				var requestJson = '';
				if (self.PayType() == 'alipay')
					requestJson = ret.requestJson;
				else
					requestJson = JSON.stringify(ret.requestJson);
				//alert(self.PayType() + ' ' + typeof requestJson + ' ' + requestJson);

				//根据支付方式、订单信息，调用支付操作
				Pay.pay(payType, requestJson, function(tradeno) { //成功后的回调函数
					//plus的pay有可能在微信支付成功的同步返回时，并未返回tradeno
					if (tradeno == '' || typeof tradeno == 'undefined') {
						plus.nativeUI.closeWaiting();
						mui('#middlePopover').popover("toggle");
						common.refreshOrder(); //刷新订单
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
							common.refreshOrder(); //刷新订单
							successPayCB();
							return true;
						},
						error: function() {
							common.setEnabled(evt);
							plus.nativeUI.closeWaiting();
							failureCB(orderID, ret.expireMinutes);
							return true;
						}
					})
				}, function() {
					common.setEnabled(evt);
					plus.nativeUI.closeWaiting();
					if (typeof failureCB != 'undefined') {
						failureCB(orderID, ret.expireMinutes);
					}

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

/**
 * 
 * @param {String} id     			dom id
 * @param {Number} deep   			html页面深度
 * @param {JSON} payJson			支付方式的显示，支持空、"true"/"false"、ko变量或表达式，如{"alipay": "true", "balance": "regUsingFree() == false", "free": "regUsingFree"}
 * @param {JSON} textJson			文字的绑定，支持ko变量或定义，如{"discountText": "discountText", "balanceText": "ko.observable(888.88)", "freeTimesText": "freeActivityCount", "pricePay": "pricePay", "price": "price"}
 * @param {Boolean} vipDiscount		是否显示余额支付的折扣信息
 * @param {String} payAction		点击付款响应的方法
 */

var PayBox = function(id, deep, payJson, textJson, vipDiscount, payAction) {
	var self = this;

	id = id || 'PayBox';
	deep = deep || 0;
	payJson = payJson || {};
	vipDiscount = vipDiscount || false;
	payAction = payAction || 'gotoPay';
	
	var deepHtml = '';
	for (var i = 0; i < deep; i++) {
		deepHtml += '../';
	}

	//初始化
	self.initBox = function() {
		var strTmp = '', strClass = '', strSpan = '';
		var payBox = document.getElementById(id);
		var payBoxHtml = '<div id="opacity-bg" class="opacity-bg"></div><div class="pay-popup"><div class="payment-title"><i class="iconfont close-pay" id="closeIcon">&#xe63f;</i> <span>付款详情</span></div><ul id="payList" class="pay-method">';
		
		//############控制支付方式的显示############### BEGIN
		if(common.StrIsNull(payJson.wxpay) != ''){
			strTmp = ' data-bind="visible: '+payJson.wxpay+'"';
		}
		payBoxHtml += '<li value="wxpay"'+strTmp+'><div class="method-logo"><img src="' + deepHtml + 'images/submitClass-wx.png"></div><span class="default-lineHeight">微信支付</span> <i class="iconfont default-icon"></i></li>';
		
		if(common.StrIsNull(payJson.alipay) != ''){
			strTmp = ' data-bind="visible: '+payJson.alipay+'"';
		}
		payBoxHtml += '<li value="alipay"'+strTmp+'><div class="method-logo"><img src="' + deepHtml + 'images/ali.png"></div><span class="default-lineHeight">支付宝</span> <i class="iconfont default-icon"></i></li>';
		
		if(common.StrIsNull(payJson.balance) != ''){
			strTmp = ' data-bind="visible: '+payJson.balance+'"';
		}
		if (!vipDiscount) {
			strClass = 'default-lineHeight';
			strSpan = '';
		} else {
			strClass = 'discount-lineHeight';
			strSpan = '<span class="discount-span" data-bind="text: '+textJson.discountText+'">享8.5折</span>';
		}
		payBoxHtml += '<li value="balance"'+strTmp+'><div class="method-logo"><img src="' + deepHtml + 'images/ye.png"></div><span class="'+strClass+'" data-bind="text: &apos;余额支付( ￥ &apos; + '+textJson.balanceText+'() + &apos; )&apos;">余额支付( ￥999.00 )</span> <i class="iconfont default-icon"></i>'+strSpan+'</li>';
		
		if(common.StrIsNull(payJson.free) != ''){
			strTmp = ' data-bind="visible: '+payJson.free+'"';
		}
		payBoxHtml += '<li value="free"'+strTmp+'><div class="method-logo"><img src="' + deepHtml + 'images/free-pay.png"></div><span class="discount-lineHeight" data-bind="text: &apos;免支付( 剩余&apos; + '+textJson.freeTimesText+'() + &apos;次 )&apos;">免费报名( 剩余2次 )</span> <i class="iconfont default-icon"></i><span class="discount-span">会员独享</span> </li>';
		//############控制支付方式的显示############### END
		
		payBoxHtml += '</ul><div class="pay-total"><span>总价：</span> <span class="total-value"><em data-bind="text: &apos;￥&apos;+'+textJson.pricePay+'()">200.00</em> <em class="lineHeight-decoration" data-bind="text: &apos;￥&apos;+'+textJson.price+'(), visible: '+textJson.pricePay+'() != '+textJson.price+'()">￥300.00</em></span></div><button class="p-btn-color pay-total-btn" data-bind="event: {tap: ' + payAction + '}">付款</button> <span class="recharge" id="gotoRecharge">余额不足，<em>去充值</em></span></div>';
		payBox.innerHTML = payBoxHtml;
	}();

	//选择回调并初始选择
	self.changePay = function(callback) {
		self.callback = callback;
	}

	var payList = document.getElementById('payList');
	payList.addEventListener('tap', function(ev) {
		var ev = ev || window.event;
		var target = ev.target || ev.srcElement;
		while (target.nodeName.toLowerCase() !== "li") {
			target = target.parentNode;
		}
		var pl = target.parentNode.childNodes;
		for (var i = 0; i < pl.length; i++) {
			pl[i].childNodes[3].classList.remove('check-icon');
		}
		target.childNodes[3].classList.add('check-icon');
		//console.log(target.childNodes[3].classList);
		//console.log(target.getAttribute('value'));
		var value = target.getAttribute('value');
		self.callback(value);
	});
	
	document.getElementById('gotoRecharge').addEventListener('tap', function(ev) {
		common.transfer(deepHtml + 'modules/my/recharge.html', true);
	});

	document.getElementById('closeIcon').addEventListener('tap', function(ev) {
		self.hide();
	});
	
	function stopscroll(e) {
		e.preventDefault(); 
	}
	
	//显示插件
	self.show = function() {
		document.getElementById(id).style.cssText = "display: block";
		document.addEventListener('touchmove', stopscroll);
	}

	//隐藏插件
	self.hide = function() {
		document.getElementById(id).style.cssText = "display: none";
		document.removeEventListener('touchmove', stopscroll);
	}
	
	//选择支付方式
	self.selectPay = function(payType){
		var pl = document.querySelectorAll('#payList li');
		for (var i = 0; i < pl.length; i++) {
			if (pl[i].getAttribute('value') === payType) {
				pl[i].childNodes[3].classList.add('check-icon');
				self.callback(payType);
				//break;
			}
			else{
				pl[i].childNodes[3].classList.remove('check-icon');
			}
		}
	}

	//点击背景隐藏
	var payBackgroud = document.getElementById('opacity-bg');
	payBackgroud.addEventListener('tap', function() {
		self.hide();
	});
};