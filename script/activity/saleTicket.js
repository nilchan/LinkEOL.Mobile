var payBox = new PayBox('PayBox', 2, {
		"wxpay": "true",
		"alipay": "true",
		"balance": "true",
		"free": "regUsingFree"
	}, {
		"discountText": "discountText",
		"balanceText": "balance",
		"freeTimesText": "freeActivityCount",
		"pricePay": "TotalAmountPay",
		"price": "TotalAmount"
	}, true, 'gotoPay');

var saleTicket = function() {
	var self = this;
	var orderID = 0; 					//保存成功后返回的订单ID（若未能支付成功，亦可立刻再次支付）
	var targetID = 0, targetType = 0;	//订单对应的货品ID，货品类型
	var ticketCount = 0;				//总票数

	self.custormPriceList = ko.observableArray([]); //票价信息
	self.TotalAmount = ko.observable(0); //票价总价
	self.paid = ko.observable(false); //是否已支付
	self.isHaveTicket = ko.observable(false);

	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否

	self.payRemainTime = ko.observable('');
	self.ticketUrl = ko.observable(''); //座位示意图URL
	self.balance = ko.observable(0); //余额

	self.TotalAmountPay = ko.observable(0);
	self.vipLevel = ko.observable(0);
	self.freeActivityCount = ko.observable(0);
	self.regUsingFree = ko.observable(false);
	self.vipDiscounts = ko.observableArray([]);
	self.discount = ko.observable(1);
	self.discountText = ko.observable('无折扣');

	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');

	var ActivityID;
	var SeatPrice = [];
	var ticketInfo;

	self.checkPayType = function(value) {
		PayType(value);
		
		switch(self.PayType()){
			case 'balance':
				self.TotalAmountPay((self.TotalAmount() * self.discount()).toFixed(2));
				break;
			case 'free':
				self.TotalAmountPay(0);
				break;
			default:
				self.TotalAmountPay(self.TotalAmount());
				break;
		}
	}
	payBox.changePay(self.checkPayType);


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
		for (var i = 0; i < self.custormPriceList().length; i++) {
			if (self.custormPriceList()[i].BuySeatNum <= 0) {
				self.isHaveTicket(false);
			} else {
				self.isHaveTicket(true);
				break;
			}
		}
		ticketCount = 0;
		self.custormPriceList().forEach(function(item) {
			count += item.SeatPrice * item.BuySeatNum;
			ticketCount += item.BuySeatNum;
		});
		self.TotalAmount(count);
		self.TotalAmountPay(self.TotalAmount());
		self.initPayInfo();
	}

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				console.log(responseText);
				self.balance(result.Amount);
				self.freeActivityCount(result.FreeActivityCount);
				self.vipLevel(result.VIPLevel);
				self.initPayInfo();
			}
		});
	}

    //获取活动的支付相关信息
    self.getPayJson = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfoByActivityID?ActivityID=' + ActivityID;
        if(self.ViewOrder()){
        	url = common.gServerUrl + 'API/Order/GetPayInfoByTarget?targetType=' + targetType + '&targetId=' + targetID;
        }
        console.log(url);
        mui.ajax(url,{
            type: 'GET',
            success: function(result) {
            	console.log(result);
                var obj = JSON.parse(result);
                self.regUsingFree(obj.RegUsingFree);
                if(common.StrIsNull(obj.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(obj.VIPDiscountJson));
                }
                self.initPayInfo();
            }
        });
    };
    
	//初始化支付信息：计算可获取的折扣、若支持免费次数且有免费次数则默认选中次数支付
	self.initPayInfo = function() {
		if (self.vipDiscounts().length > 0 && self.vipLevel() > 0) {
			self.vipDiscounts().forEach(function(item) {
				if (item.VIPLevel == self.vipLevel()) {
					self.discount(item.Discount);
					if (self.discount() >= 1) {
						self.discountText('无折扣');
					} else if (self.discount() <= 0) {
						self.discountText('免费报名');
					} else {
						self.discountText('享受' + (self.discount() * 10) + '折');
					}
					return;
				}
			})
		}

		if (self.regUsingFree() == true && self.freeActivityCount() > 0) {
			self.TotalAmountPay(0);
			self.PayType('free');
		}
		/*else{
			self.TotalAmountPay(self.TotalAmount());
			self.PayType('wxpay');
		}*/
		payBox.selectPay(self.PayType());
	}

	self.openPaybox = function(){
		if( self.isHaveTicket() == true ) {
			payBox.show();
		}
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
				//mui('#middlePopover').popover("hide");
				payBox.hide();
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}

			if (self.PayType() == 'free' && ticketCount > self.freeActivityCount()) {
				mui.toast("总票数不能超出免费次数");
				return;
			}
			
			SeatPrice = []; //清空原有的票信息
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
			orderID,
			function(newOrderID, expireMinutes) {
				orderID = newOrderID;
				self.ViewOrder(true);
				if (expireMinutes > 0) {
					var oTime = newDate();
					maxtime = (newDate(oTime).getTime() + expireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
				}
			},
			function() {
				mui.back();
			});
	};

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
					console.log(JSON.stringify(arr));
					self.custormPriceList([]); //先清除
					self.custormPriceList(arr);
					//console.log(JSON.stringify(self.custormPriceList()));
					self.custormPriceList().forEach(function(item) {
						if (item.BuySeatNum > 0) {
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

	//检查是否有未支付的订单
	self.checkOrderExist = function(){
		var url = common.gServerUrl + 'API/ActTicket/GetNotFinishedTicketOrder?ActivityID=' + ActivityID + 
			'&userId='+getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				//var hasOrder = false;
				if(common.StrIsNull(responseText) != ''){
					var result = JSON.parse(responseText);
					console.log(responseText);
					if(result){	//存在已有的订单
						mui.alert('存在未支付的订单，请先完成支付','提示','确定');
						self.initOrderInfo(result);
						//hasOrder = true;
					}
				}
				
				/*if(!hasOrder){
					self.getSeatRegionList();
				}*/
			}
		});
	}
	
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

	self.initOrderInfo = function(order){
		orderID = order.ID;
		self.ViewOrder(true);
		self.paid(order.IsFinish);
		self.TotalAmount(order.Amount);
		targetID = order.TargetID;
		targetType = order.TargetType;
		self.getDataForOrder(order.TargetID);
		var oTime = order.OrderTime;
		maxtime = (newDate(oTime).getTime() + order.ExpireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
	}

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
			
			self.checkOrderExist();
		}
		
		if (typeof(thisWebview.order) != "undefined") { //从订单跳转进来
			var orderTmp = thisWebview.order;
			self.initOrderInfo(orderTmp);
		}
		self.getPayJson();
	})
}
ko.applyBindings(saleTicket);