var saleTicket = function() {
	var self = this;
	var orderID = 0;	//保存成功后返回的订单ID（若未能支付成功，亦可立刻再次支付）
	
	self.custormPriceList = ko.observableArray([]); //票价信息
	self.TotalAmount = ko.observable(0); //票价总价
	self.paid = ko.observable(false); //是否已支付
	self.isHaveTicket=ko.observable(false);

	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否

	self.payRemainTime = ko.observable('');
	self.ticketUrl = ko.observable('');	//座位示意图URL
	self.balance = ko.observable(0); //余额
	
	var ActivityID;
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
		var ticketJson = "";

		if (!(self.ViewOrder() || orderID > 0)) { //不是由我的订单跳转而来，或者未曾保存过订单
			var isSaleticket = false; //是否有购票
			self.custormPriceList().forEach(function(item) {
				if (item.BuySeatNum != 0) {
					isSaleticket = true;
					return;
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
			};
			ticketJson = JSON.stringify(ticket);
		}
		
		Pay.preparePay(ticketJson, self.PayType(), common.gDictOrderTargetType.Ticket, 
			orderID, function(newOrderID, expireMinutes){
				orderID = newOrderID;
				if(expireMinutes > 0){
					var oTime = newDate();
					maxtime = (newDate(oTime).getTime() + expireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
				}
			}, function(){
				mui.back();
			});
	};

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
		var ajaxUrl = common.gServerUrl + '/API/ActTicket/ActTicketInfo?ticketId=' + ticketId;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				if (common.StrIsNull(responseText) != '') {
					ticketInfo = JSON.parse(responseText);
					var arr = JSON.parse(ticketInfo.SeatPrice);
					self.custormPriceList([]); //先清除
					self.custormPriceList(arr);
					//console.log(JSON.stringify(self.custormPriceList()));
					self.custormPriceList().forEach(function(item){
						if(item.BuySeatNum>0){
							self.isHaveTicket(true);
							return;
						}
					})
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
			var orderTmp = thisWebview.order;
			orderID = orderTmp.ID;
			self.ViewOrder(true);
			self.paid(orderTmp.IsFinish);
			self.TotalAmount(orderTmp.Amount);
			self.getDataForOrder(orderTmp.TargetID);
			var oTime = orderTmp.OrderTime;
			maxtime = (newDate(oTime).getTime() + orderTmp.ExpireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
		}
	})
}
ko.applyBindings(saleTicket);
