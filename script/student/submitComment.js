var viewModel = function() {
	var self = this;
	self.works = ko.observable({});
	self.teacher = ko.observable({});
	self.Amount = ko.observable(50); //点评费用
	self.paid = ko.observable(false); //是否已支付
	self.balance = ko.observable(0); //余额
	self.isHomeWork = ko.observable(false); //交作业

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

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
				//console.log(JSON.stringify(self.teacher()))
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

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		//从订单跳转过来
		if (typeof(web.order) != "undefined") {
			self.Order(web.order);
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

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else if (self.PayType() == 'balance') {
			paytype = 4;
		} else {
			paytype = 3;
		}

		if (!self.ViewOrder()) { //不是由我的订单跳转而来
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

			ajaxUrl = common.gServerUrl + 'API/Comment/AddComment?payType=' + paytype;
			if (self.isHomeWork()) {
				ajaxUrl = common.gServerUrl + 'Common/Work/AddHomeWork?payType=' + paytype + '&workId=' + self.works().ID + '&TeacherUserID=' + self.teacher().UserID;
				comment = '';
			}
		} else {
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + self.Order().ID + '&payType=' + paytype;
			//console.log(ajaxUrl);
		}

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();
		//新增则保存点评信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: self.ViewOrder() ? self.Order() : comment,
			success: function(responseText) { //responseText为微信支付所需的json
				var ret = JSON.parse(responseText);
				var orderID = ret.orderID; //订单跳转回来并无orderID,requestJson
				
				//订单已生成，此时相当于浏览订单
				self.Order().ID = ret.orderID;
				self.ViewOrder(true);
				
				if (ret.requestJson == '') { //无需网上支付，预约点评成功
					mui.toast("已成功提交");
					plus.nativeUI.closeWaiting();
					common.refreshMyValue({
						valueType: 'balance',
					});
					common.refreshOrder();//刷新订单
					common.transfer('../works/worksListMyHeader.html', true, {}, false, false);
				} else {
					var requestJson = JSON.stringify(ret.requestJson);
					//console.log(requestJson);
					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						var aurl = common.gServerUrl + 'API/Order/?id=' + orderID + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								var comment = JSON.parse(respText);
								common.refreshMyValue({
										valueType: 'balance',
								});
								common.refreshOrder();//刷新订单
								common.transfer('../works/worksListMyHeader.html', true, {}, false, false);
								plus.nativeUI.closeWaiting();
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
				console.log("order error")
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		})
	};

	//popover的关闭功能
	self.closePopover = function() {
		mui('#middlePopover').popover('hide');
	}
};

ko.applyBindings(viewModel);