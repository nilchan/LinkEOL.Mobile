var viewModel = function() {
	var self = this;
	
	var orderID = 0, orderType = 0;
	self.works = ko.observable({});
	self.teacher = ko.observable({});
	self.Amount = ko.observable(50); //点评费用
	self.paid = ko.observable(false); //是否已支付
	self.balanceGot = ko.observable(false); //是否已获取余额
	self.balance = ko.observable(0); //余额
	self.isHomeWork = ko.observable(false); //交作业
	self.freeCount = ko.observable(0);  //免费次数
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	/**
	 * 为显示订单的点评信息而获取数据
	 * @param {Int} commentID 点评ID
	 */
	self.getDataForOrder = function(commentID) {
		self.ViewOrder(true); //标记由我的订单跳转而来
		var ajaxUrl = common.gServerUrl + 'API/Comment/GetCommentInfoByID?id=' + commentID;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var data = JSON.parse(responseText);
				//console.log(JSON.stringify(data.teacher));
				if (data.works) {
					self.works(data.works);
				}
				if (data.teacher) {
					self.teacher(data.teacher);
				}
			}

		});
	}

	self.getAmount = function() {
		var ajaxUrl = common.gServerUrl + 'API/Comment/GetCommentPrice?userId=' + self.teacher().UserID;
		if (self.isHomeWork()) {
			var ajaxUrl = common.gServerUrl + 'API/Comment/GetHomeWorkPrice';
		}
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				self.Amount(responseText);
			}
		});
	}
	
	self.gotoRecharge = function() {
		common.transfer('/modules/my/recharge.html', true);
	}

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		if( self.isHomeWork() ) {
			url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		}
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var ret = JSON.parse(responseText);
				self.balance(ret.Amount);
				if(ret.FreeCount)
					self.freeCount(ret.FreeCount);
				
				self.balanceGot(true);
			},error:function(){
				self.balanceGot(true);
			}
		});
	}

	self.confirmContinue = function() {
		var message = this;
		var btnArray = ['是', '否'];
		mui.confirm('作品已找过该老师点评，是否继续？', '点评确认', btnArray, function(e) {
			if (e.index == 0) {
				self.getAmount();
			} else {
				mui.back();
			}
		});
	}

	//刷新余额
	window.addEventListener('refeshBalance', function(event) {
		self.getBalance();
	});

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		//从订单跳转过来
		if (typeof(web.order) != "undefined") {
			self.Order(web.order);
			orderID = self.Order().ID;
			orderType = self.Order().TargetType;
			self.Amount(self.Order().Amount);
			self.paid(self.Order().IsFinish);
			getDataForOrder(self.Order().TargetID);
		} else {
			if (typeof(web.works) !== "undefined") {
				self.works(web.works);
			}
			if (typeof(web.teacher) !== "undefined") {
				self.teacher(web.teacher);
				//console.log(JSON.stringify(self.teacher()));
			}
			if (typeof(web.homeWork) !== "undefined") {
				self.isHomeWork(web.homeWork);
			}
			//判断是否已存在类似的点评（相同作品和老师）
			var ajaxUrl = common.gServerUrl + "API/Comment/CheckSimilarComment?workId=" + self.works().ID + "&teacherId=" + self.teacher().UserID;
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					if (Number(responseText) > 0) {
						self.confirmContinue();
					} else {
						self.getAmount();
					}
				}
			});
		}
		self.getBalance();
	});

	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号
	//支付的生成订单
	self.gotoPay = function() {
		var ajaxUrl;
		var comment;
		var type;
		var commentJson = "";
		
		if (!self.ViewOrder() || orderID > 0) { //不是由我的订单跳转而来
			if (!self.works().ID) {
				mui.toast("请选择作品");
				return;
			}
			if (!self.teacher().UserID) {
				mui.toast("请选择点评老师");
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}

			//准备点评信息
			comment = {
				WorkID: self.works().ID,
				WorkTitle: self.works().Title,
				AuthorID: self.works().AuthorID,
				CommenterID: self.teacher().UserID,
				Amount: self.Amount()
			}
			
			if( self.isHomeWork() ) {
				type = common.gDictOrderTargetType.Homework;
			} else {
				type = common.gDictOrderTargetType.Comment;
			}
			
			if( orderType > 0 ) {
				type = orderType;
			}
			
			commentJson = JSON.stringify(comment);
		}
		
		Pay.preparePay(commentJson, self.PayType(), type, 
			orderID, function(newOrderID, expireMinutes){
				orderID = newOrderID;
			}, function(){
				mui.back();
				common.transfer('../works/worksListMyHeader.html', true, {}, false, false);
			});
	};

	//popover的关闭功能
	self.closePopover = function() {
		mui('#middlePopover').popover('hide');
	}
};

ko.applyBindings(viewModel);