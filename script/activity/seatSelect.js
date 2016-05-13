var seatSelect = function() {
	var self = this;

	var isPaid = false; //是否完成支付

	//活动id，区域id，行数，区域总数, 初始缩放比例，初始高度, 
	var aid = 78,
		rid = 1,
		row = 15,
		count = 20,
		initalScale = 1,
		initalHeight = 21;
	self.seatLevelList = ko.observableArray([]); //座位等级列表
	self.regionName = ko.observable(''); //区域名称
	self.seatList = ko.observable([]); //座位图
	self.selectSeatList = ko.observableArray([]); //选择座位列表
	self.selectFormatList = ko.observableArray([]); //格式化座位列表
	self.seatRegionList = ko.observableArray([]); //座位区域列表
	self.totalPrice = ko.observable(0); //总价
	self.totalCount = ko.observable(0); //总数量
	self.balance = ko.observable(0);

	//初始化座位列表
	for (var i = 0; i < row; i++) {
		self.seatList()[i] = ko.observableArray([]);
	}

	//初始化格式化座位列表
	for (var i = 0; i < count; i++) {
		self.selectFormatList()[i] = ko.observableArray([]);
	}

	//区域转换
	function getFormatRegion(id) {
		//		return id;
		for (var i = 0; i < self.seatRegionList().length; i++) {
			if (self.seatRegionList()[i].ID === id) return self.seatRegionList()[i].FormatRegion;
		}
	}

	//添加座位
	function addSeat(obj) {
		self.selectSeatList.push(obj);

		formatSeat();

		setLocalItem('seatListJSON', JSON.stringify(self.selectSeatList()));
	}

	//删除座位
	function deleteSeat(obj) {
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

	//格式化座位
	function formatSeat() {
		for (var i = 0; i < count; i++) {
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
	}

	//初始化座位图
	function initSeat() {
		var localSeatJSON = getLocalItem('seatListJSON');
		if (localSeatJSON === '') return;
		var localSeat = JSON.parse(localSeatJSON);

		self.selectSeatList(localSeat);

		self.selectSeatList().forEach(function(item) {
			if (rid === item.RegionID) {
				$('#seatGraph').children().eq(item.X - 1).children().eq(item.Y - 1).addClass('pitch-on');
			}
		});

		formatSeat();
	}

	//获取座位等级
	self.getSeatLevelList = function() {
		var url = common.gServerUrl + 'Common/Seat/SeatLevelList?ActivityID=' + aid;

		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.seatLevelList(JSON.parse(responseText));
			}
		});
	};

	//获取座位图
	self.getSeatList = function() {
		var url = common.gServerUrl + 'Common/Seat/SeatList?ActivityID=' + aid + '&RegionID=' + rid;
		//plus.nativeUI.showWaiting();
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				console.log(responseText.substring(0, 700));
				var obj = JSON.parse(responseText);

				obj.forEach(function(item) {
					self.seatList()[item.X - 1].push(item);
				});

				initSeat();
				//plus.nativeUI.closeWaiting();
			}/*,
			error: function(){
				plus.nativeUI.closeWaiting();
			}*/
		});
	};

	//选择座位
	self.selectOne = function(obj) {
//		console.log(JSON.stringify(obj));
		if (obj.SeatStatus !== 1) return;
		var thisDom = $('#seatGraph').children().eq(obj.X - 1).children().eq(obj.Y - 1);
		if (thisDom.length === 0) {
			mui.toast('座位异常');
			return;
		}
		if (thisDom.hasClass('pitch-on')) {
			thisDom.removeClass('pitch-on');
			deleteSeat(obj);
		} else {
			thisDom.addClass('pitch-on');
			addSeat(obj);
		}
	};

	//点击删除
	self.deleteOne = function(obj) {
		var tmpArray = [];

		if (obj.RegionID === rid) {
			var thisDom = $('#seatGraph').children().eq(obj.X - 1).children().eq(obj.Y - 1);
			if (thisDom.length === 0) {
				mui.toast('座位异常');
				return;
			}
			if (thisDom.hasClass('pitch-on')) {
				thisDom.removeClass('pitch-on');
			} else {
				thisDom.addClass('pitch-on');
			}
		}

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
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
				common.showCurrentWebview();
			},
			error: function() {
				common.showCurrentWebview();
			}
		});
	}

	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}

	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	//支付
	self.gotoPay = function() {
		var ticketJSON = "",
			submitTicketArray = [],
			orderID = 0;

		if (self.selectSeatList().length === 0) {
			mui.toast('请至少选择一张票');
			mui('#middlePopover').popover("hide");
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
			function(newOrderID) {
				orderID = newOrderID;
			},
			function() {
				removeLocalItem('seatListJSON');
				isPaid = true;
				mui.back();
			},function(newOrderID, expireMinutes) {
				orderID = newOrderID;
				if(expireMinutes > 0){
					var oTime = newDate();
					maxtime = (newDate(oTime).getTime() + expireMinutes * 60 * 1000 - newDate().getTime()) / 1000;
				}
				var my = plus.webview.currentWebview().opener();
				mui.fire(my, 'payFail', {
					orderID: orderID,
					maxtime: maxtime
				});
				mui.back();
			});
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				var initX = -1,
					initY = -1,
					moveX = 0,
					moveY = 0,
					movedX = 0,
					movedY = 0;

				$$('#seatArea').swiping(function(e) {

					e.preventDefault();
					e.stopPropagation();

					if (e.originalEvent.touches.length === 0) return;

					var tmpX = e.originalEvent.touches[0].pageX;
					var tmpY = e.originalEvent.touches[0].pageY;

					if (initX === -1) {
						initX = tmpX;
						initY = tmpY;
						return;
					}

					moveX = tmpX - initX;
					moveY = tmpY - initY;

					var tmpMoveX = movedX + moveX;
					var tmpMoveY = movedY + moveY;

					$('#seat-box').css('transform', 'translate(' + tmpMoveX + 'px,' + tmpMoveY + 'px)');
					//		document.getElementById('seat-box').scrollLeft -= moveX;
					//		document.getElementById('seat-box').scrollTop -= moveY;

					//		initX = tmpX;
					//		initY = tmpY;
				});

				$$('#seatArea').swipe(function(e) {
					if (e.originalEvent.scale !== 1) return;
					movedX += moveX;
					movedY += moveY;
					initX = -1;
					initY = -1;
				});

				$$('#seatArea').pinching(function(e) {
					$('#seatGraph').css('transform', 'scale(' + initalScale * e.originalEvent.scale + ')');
				});

				$$('#seatArea').pinch(function(e) {
					initalScale *= e.originalEvent.scale;
					initalHeight *= e.originalEvent.scale;
				});
			} else {
				$('#seatGraph').css('overflow', 'scroll');
			}
		});
	}

	mui.plusReady(function() {
		var thisWebview = plus.webview.currentWebview();
		if (typeof thisWebview.ActivityID != "undefined") {
			aid = thisWebview.ActivityID;
			rid = thisWebview.RegionID;
			row = thisWebview.Row;
			self.seatRegionList(thisWebview.RegionList);
			self.regionName(thisWebview.RegionName + '区');
		}
		self.getSeatLevelList();
		self.getSeatList();
		self.getBalance();
	});

	mui.init({
		beforeback: function() {
			var my = plus.webview.currentWebview().opener();
			if (isPaid) {
				mui.fire(my, 'backAgain');
			} else {
				mui.fire(my, 'refreshTicket');
			}

			return true;
		}
	})
};

ko.applyBindings(seatSelect);