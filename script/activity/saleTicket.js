var saleTicket = function() {
	var self = this;
	self.custormPriceList = ko.observableArray([]); //票价信息
	self.TotalAmount = ko.observable(0); //票价总价
	self.paid = ko.observable(false); //是否已支付
	self.isHaveTicket=ko.observable(false);

	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号

	self.OrderID = ko.observable(0); //保存成功后返回的订单ID（若未能支付成功，亦可立刻再次支付）

	self.payRemainTime = ko.observable('');
	self.ticketUrl = ko.observable('');	//座位示意图URL
	self.balance = ko.observable(0); //余额
	
	var ActivityID;
	var isSaleticket = false; //是否 有购票
	var SeatPrice = [];
	var ticketInfo;


	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	//减少票
	self.sub = function(data) {
		if (self.ViewOrder()) {
			mui.toast('已保存的订单不允许修改数量');
			return;
		}
		data.BuySeatNum = data.BuySeatNum - 1;
		if (data.BuySeatNum < 0) {
			data.BuySeatNum = 0;
			return;
		}
		self.custormPriceList().forEach(function(item) {
				var tmp = common.clone(item);
				if (item.Id == data.Id) {
					tmp.BuySeatNum = data.BuySeatNum;
					self.custormPriceList.replace(item, tmp);
				}
			})
			
			calcPrice();
	}

	//增加票
	self.add = function(data) {
		if (self.ViewOrder()) {
			mui.toast('已保存的订单不允许修改数量');
			return;
		}
		data.BuySeatNum = data.BuySeatNum + 1;
		
		if (data.BuySeatNum > data.SeatRemain) {
			data.BuySeatNum = data.SeatRemain;
			return;
		}
		self.custormPriceList().forEach(function(item) {
				var tmp = common.clone(item);
				if (item.Id == data.Id) {
					tmp.BuySeatNum = data.BuySeatNum;
					self.custormPriceList.replace(item, tmp);
				}
			})
		calcPrice();

	}

	//检查票
	self.checkTicket = function(data) {
		if (data.BuySeatNum > data.SeatRemain) {
			self.custormPriceList().forEach(function(item) {
				var tmp = common.clone(item);
				if (item.Id == data.Id) {
					tmp.BuySeatNum = data.SeatRemain;
					self.custormPriceList.replace(item, tmp);
				}
			})
			mui.toast("超出最大余票数量");
		}
		if (data.BuySeatNum < 0) {
			self.custormPriceList().forEach(function(item) {
				var tmp = common.clone(item);
				if (item.Id == data.Id) {
					tmp.BuySeatNum = 0;
					self.custormPriceList.replace(item, tmp);
				}
			})
		}
		calcPrice();
	}

	//计算
	var calcPrice = function() {
		var count = 0;
		for(var i=0;i<self.custormPriceList().length;i++){
			if(self.custormPriceList()[i].BuySeatNum<=0){
				self.isHaveTicket(false);
			}else{
				self.isHaveTicket(true);
				break;
			}
		}
		self.custormPriceList().forEach(function(item) {
			count += item.SeatPrice * item.BuySeatNum;
		});
		self.TotalAmount(count);
	}
	
	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
			}
		});
	}

	//支付
	self.gotoPay = function() {

		var ajaxUrl;
		var ticket;

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else if (self.PayType() == 'balance'){
			paytype = 4;
		} else {
			paytype = 3;
		}

		/*console.log('ViewOrder: '+self.ViewOrder());
		console.log('OrderID: '+self.OrderID());*/

		if (!(self.ViewOrder() || self.OrderID() > 0)) { //不是由我的订单跳转而来，或者未曾保存过订单
			self.custormPriceList().forEach(function(item) {
				if (item.BuySeatNum != 0) {
					isSaleticket = true;
				}
			})
			if (!isSaleticket) {
				mui.toast("请至少选择一张票");
				mui('#middlePopover').popover("hide");
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}


			SeatPrice = [];	//清空原有的票信息
			self.custormPriceList().forEach(function(item) {
				SeatPrice.push({
					"Id": item.Id,
					"SeatName": item.SeatName,
					"SeatPrice": item.SeatPrice,
					"BuySeatNum": item.BuySeatNum,
					"TotalPrice": item.SeatPrice * item.BuySeatNum
				})
			})


			//准备售票信息
			ticket = {
					ActivityID: ActivityID,
					UserID: getLocalItem('UserID'),
					SeatPrice: JSON.stringify(SeatPrice)
				}
				//console.log(JSON.stringify(ticket));

			ajaxUrl = common.gServerUrl + 'API/ActTicket?payType=' + paytype;
		} else {
			var orderID;
			if (self.ViewOrder())
				orderID = self.Order().ID;
			else
				orderID = self.OrderID();
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + orderID + '&payType=' + paytype;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();
		//新增则保存点评信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: (self.ViewOrder() || self.OrderID() > 0) ? null : ticket,
			success: function(responseText) { //responseText为微信支付所需的json
				var ret = JSON.parse(responseText);
				if (ret.orderID && ret.orderID > 0) {
					self.OrderID(ret.orderID); //订单跳转的状态，其返回并无orderID,requestJson
					self.Order({
						ID: ret.orderID,
						AmountInFact: self.TotalAmount(),
						Amount: self.TotalAmount(),
						UserID: getLocalItem('UserID'),
						TargetType: common.gDictOrderTargetType.Ticket
					});
					
					//订单已生成，此时相当于浏览订单
					self.ViewOrder(true);
				}

				if (ret.requestJson == '') { //无需网上支付，预约点评成功
					mui.toast("已成功售票");
					//跳转至点评（暂时未打开）
					common.refreshMyValue({
						valueType: 'balance'
					})
					plus.nativeUI.closeWaiting();
					common.refreshOrder();//刷新订单
					mui.back();
				} else {
					var requestJson = JSON.stringify(ret.requestJson);
					//console.log(requestJson);
					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						if(tradeno == '' || typeof tradeno == 'undefined'){
							plus.nativeUI.closeWaiting();
							mui.back();
							return;
						}
						
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id=' + self.OrderID() + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								//var ticket = JSON.parse(respText);
								plus.nativeUI.closeWaiting();
								common.refreshMyValue({
									valueType: 'balance',
								})
								common.refreshOrder();//刷新订单
								mui.back();
							},
							error: function() {
								common.setEnabled(evt);
							}
						})
					}, function() {
						common.setEnabled(evt);
						plus.nativeUI.closeWaiting();
					});
				}
			},
			error: function() {
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		})
	};

	//popover的关闭功能
	self.closePopover = function() {
		mui('#middlePopover').popover('hide');
	}


	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}

	/**
	 * 为显示订单的购票信息而获取数据
	 * @param {Int} ticketId 购票ID
	 */
	self.getDataForOrder = function(ticketId) {
		self.ViewOrder(true); //标记由我的订单跳转而来
		var ajaxUrl = common.gServerUrl + '/API/ActTicket/ActTicketInfo?ticketId=' + ticketId;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				if (common.StrIsNull(responseText) != '') {
					ticketInfo = JSON.parse(responseText);
					var arr = JSON.parse(ticketInfo.SeatPrice);
					self.custormPriceList([]); //先清除
					self.custormPriceList(arr);
				} else {
					mui.toast('订单已失效');
					mui.back();
				}
			}

		});
	}

	//gotoShowset
	self.gotoShowset = function() {
		common.transfer("../home/webModer.html", true, {
			url: self.ticketUrl()
		});
	}

	//
	mui.init({
		beforeback: function() {
			var activityInfo = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(activityInfo));
			if (activityInfo.id == "activityInfo.html") {
				mui.fire(activityInfo, 'refreshActivityInfo');
			} else if (activityInfo.id == "myOrders.html") {
				mui.fire(activityInfo, 'refreshOrderInfo');
			}

			//返回true，继续页面关闭逻辑
			return true;
		}
	});

	var maxtime = 30 * 60;
	self.CountDown = function() {
		//console.log(maxtime);
		if (maxtime >= 0) {
			minutes = Math.floor(maxtime / 60);
			seconds = Math.floor(maxtime % 60);
			--maxtime;
			self.payRemainTime("00:" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
			//console.log(self.payRemainTime());
		} else {
			self.payRemainTime("00:00:00");
			clearInterval(timer);
		}
	}
	var timer = setInterval("CountDown()", 1000);

	mui.plusReady(function() {
		var thisWebview = plus.webview.currentWebview();
		self.getBalance();
		/*console.log(typeof(thisWebview.CustomPrice));
		console.log(custpriLen);*/
		if (typeof(thisWebview.CustomPrice) != "undefined") { //从活动页面跳转进来
			var CustomPrice = JSON.parse(thisWebview.CustomPrice);
			var custpriLen = CustomPrice.length;
			ActivityID = thisWebview.ActivityID;
			for (var i = 0; i < custpriLen; i++) {
				//console.log(JSON.stringify(CustomPrice[i]));
				CustomPrice[i].BuySeatNum = 0;
			}
			//console.log(JSON.stringify(customPrice));
			self.custormPriceList(CustomPrice);
			self.ticketUrl(thisWebview.TicketUrl);
		}
		//console.log(typeof(thisWebview.order));
		if (typeof(thisWebview.order) != "undefined") { //从订单跳转进来
			//console.log(JSON.stringify(thisWebview.order));
			self.Order(thisWebview.order);
			self.paid(self.Order().IsFinish);
			self.TotalAmount(self.Order().Amount);
			self.getDataForOrder(self.Order().TargetID);
			var oTime = self.Order().OrderTime;
			maxtime = (newDate(oTime).getTime() + self.Order().ExpireMinutes * 60 * 1000 - newDate().getTime()) / 1000;

		}
	})
}
ko.applyBindings(saleTicket);