var payBox = new PayBox('PayBox', 3, {
		"wxpay": "true",
		"alipay": "true",
		"balance": "true",
		"free": "regUsingFree"
	}, {
		"discountText": "discountText",
		"balanceText": "balance",
		"freeTimesText": "freeActivityCount",
		"pricePay": "totalPricePay",
		"price": "totalPrice"
	}, true, 'gotoPay');

var seatMap = function() {
	var self = this;
	var aid = 78;
	var MAX_REGIONLIST = 30;
	var orderID = 0;
	var targetID = 0, targetType = 0;	//订单对应的货品ID，货品类型

	self.seatRegionList = ko.observableArray([]);
	self.selectSeatList = ko.observableArray([]); //选择座位列表
	self.selectFormatList = ko.observableArray([]); //格式化座位列表
	self.totalPrice = ko.observable(0); //总价
	self.totalCount = ko.observable(0); //总数量
	self.balance = ko.observable(0);

	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.paid = ko.observable(false); //是否已支付
	self.payRemainTime = ko.observable('');
	
    self.totalPricePay = ko.observable(0);
    self.vipLevel = ko.observable(0);
    self.freeActivityCount = ko.observable(0);
    self.regUsingFree = ko.observable(false);
    self.vipDiscounts = ko.observableArray([]);
    self.discount = ko.observable(1);
    self.discountText = ko.observable('无折扣');
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	
	//初始化格式化座位列表
	for (var i = 0; i < MAX_REGIONLIST; i++) {
		self.selectFormatList()[i] = ko.observableArray([]);
	}

	//格式化座位
	function formatSeat() {
		for (var i = 0; i < MAX_REGIONLIST; i++) {
			self.selectFormatList()[i]([]);
		}

		var tmpPrice = 0;

		self.selectSeatList().forEach(function(item) {
			tmpPrice += item.Price;
			self.selectFormatList()[getFormatRegion(item.RegionID)].push(item);
		});
		tmpPrice = tmpPrice.toFixed(2);

		self.totalPrice(tmpPrice);
		self.totalCount(self.selectSeatList().length);
		self.totalPricePay(self.totalPrice());
		self.initPayInfo();
	}

	//初始化座位
	function initSeat() {
		var localSeatJSON = getLocalItem('seatListJSON');
		if (localSeatJSON === '') return;
		var localSeat = JSON.parse(localSeatJSON);

		self.selectSeatList(localSeat);
		formatSeat();
	}

	//区域增加属性
	function formatRegion() {
		for (var i = 0; i < self.seatRegionList().length; i++) {
			self.seatRegionList()[i]['FormatRegion'] = i;
		}
	}

	//区域转换
	function getFormatRegion(id) {
		for (var i = 0; i < self.seatRegionList().length; i++) {
			if (self.seatRegionList()[i].ID === id) return self.seatRegionList()[i].FormatRegion;
		}
	}

	self.getSeatRegionList = function() {
		var url = common.gServerUrl + 'Common/Seat/SeatRegionList?ActivityID=' + aid;
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.seatRegionList(JSON.parse(responseText));
				formatRegion();
				initSeat();
			}
		});
	}

	self.gotoSeatSelect = function() {
		var rid = this.ID;
		var rname = this.RegionName;
		var X = this.X;
		common.transfer('seatSelect.html', true, {
			ActivityID: aid,
			RegionID: rid,
			RegionName: rname,
			RegionList: self.seatRegionList(),
			Row: X

		});
	}

	self.selectOne = function(obj) {
		var tmpArray = [];

		//删除列表座位
		self.selectSeatList().forEach(function(item) {
			if (item.ID !== obj.ID) {
				tmpArray.push(item);
			}
		});

		self.selectSeatList(tmpArray);

		formatSeat();

		setLocalItem('seatListJSON', JSON.stringify(self.selectSeatList()));
	}

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.balance(result.Amount);
				self.freeActivityCount(result.FreeActivityCount);
				self.vipLevel(result.VIPLevel);
				self.initPayInfo();
				
				common.showCurrentWebview();
			},
			error: function() {
				common.showCurrentWebview();
			}
		});
	}

    //获取活动的支付相关信息
    self.getPayJson = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfoByActivityID?ActivityID=' + aid;
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
			self.totalPricePay(0);
			self.PayType('free');
		}
		payBox.selectPay(self.PayType());
	}

	self.checkPayType = function() {
		PayType(event.srcElement.value);

		switch(self.PayType()){
			case 'balance':
				self.totalPricePay((self.totalPrice() * self.discount()).toFixed(2));
				break;
			case 'free':
				self.totalPricePay(0);
				break;
			default:
				self.totalPricePay(self.totalPrice());
				break;
		}
	}
	payBox.selectPay(self.PayType());


	//支付
	self.gotoPay = function() {
		var ticketJSON = "",
			submitTicketArray = [];

		if (self.selectSeatList().length === 0) {
			mui.toast('请至少选择一张票');
			payBox.hide();
			//mui('#middlePopover').popover("hide");
			return;
		}
		
		if (self.PayType() == 'free' && self.totalCount() > self.freeActivityCount()) {
			mui.toast("总票数不能超出免费次数");
			return;
		}
		
		var i = 1;
		self.selectSeatList().forEach(function(item) {
			submitTicketArray.push({
				'Id': i,
				'ActivityID': item.ActivityID,
				'Price': item.Price,
				'RegionID': item.RegionID,
				'X': item.X,
				'Y': item.Y
			});
			i++;
		});

		var ticket = {
			ActivityID: aid,
			UserID: getLocalItem('UserID'),
			SeatPrice: JSON.stringify(submitTicketArray),
			IsOnLine: 1
		};

		ticketJSON = JSON.stringify(ticket);

		Pay.preparePay(ticketJSON, self.PayType(), common.gDictOrderTargetType.Ticket,
			orderID,
			function(newOrderID, expireMinutes) {
				orderID = newOrderID;
				self.ViewOrder(true);
				if(expireMinutes > 0){
					var oTime = newDate();
					maxtime = (newDate(oTime).getTime() + expireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
				}
			},
			function() {
				mui('#middlePopover').popover("hide");
				mui.back();
			});
	}

	_oldBack = mui.back;

	mui.back = function() {
		removeLocalItem('seatListJSON');
		_oldBack();
	}

	window.addEventListener('refreshTicket', function(event) {
		initSeat();
	})
	
	window.addEventListener('payFail', function(event) {
		orderID = event.detail.orderID;
		self.ViewOrder(true);
		maxtime = event.detail.maxtime;
	})

	window.addEventListener('backAgain', function(event) {
		mui.back();
	})

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
					//console.debug(responseText);
					ticketInfo = JSON.parse(responseText);
					
					setLocalItem('seatListJSON', ticketInfo.SeatPrice);
					self.getSeatRegionList();
					/*var arr = JSON.parse(ticketInfo.SeatPrice);
					self.selectSeatList(arr);
					formatSeat();*/
				} else {
					mui.toast('订单已失效');
					mui.back();
				}
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

	mui.plusReady(function() {
		var thisWebview = plus.webview.currentWebview();
		if (typeof thisWebview.ActivityID != "undefined") {
			aid = thisWebview.ActivityID;
		}
		
		if (typeof(thisWebview.order) != "undefined") { //从订单跳转进来
			var orderTmp = thisWebview.order;
			//console.debug(JSON.stringify(orderTmp));
			orderID = orderTmp.ID;
			self.ViewOrder(true);
			self.paid(orderTmp.IsFinish);
			self.totalPrice(orderTmp.Amount);
			targetID = orderTmp.TargetID;
			targetType = orderTmp.TargetType;
			self.getDataForOrder(orderTmp.TargetID);
			var oTime = orderTmp.OrderTime;
			maxtime = (newDate(oTime).getTime() + orderTmp.ExpireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
		}
		else{
			self.getSeatRegionList();
		}
		
		self.getBalance();
		self.getPayJson();
	});
};

ko.applyBindings(seatMap);