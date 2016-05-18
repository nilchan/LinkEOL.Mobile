var payBox = new PayBox('PayBox', 2, {
		"wxpay": "isHomeWork() == false",
		"alipay": "isHomeWork() == false",
		"balance": "true",
		"free": "isHomeWork() == true && freeCount() > 0"
	}, {
		"discountText": "ko.observable('无折扣')",
		"balanceText": "balance",
		"freeTimesText": "freeCount",
		"pricePay": "Amount",
		"price": "Amount"
	}, true, 'gotoPay');

var submitComment = function() {
	var self = this;
	var orderID = 0,
		orderType = 0;

	var maxLines = 2;
	var web;
	self.expanded = ko.observable(false); //是否已展开

	self.works = ko.observable({});
	self.teacher = ko.observableArray([]);
	self.Amount = ko.observable(50); //点评费用
	self.paid = ko.observable(false); //是否已支付
	self.balanceGot = ko.observable(false); //是否已获取余额
	self.balance = ko.observable(0); //余额
	self.isHomeWork = ko.observable(false); //交作业
	self.freeCount = ko.observable(0); //免费次数
	self.addtime = ko.observable(); //作品添加时间
	self.PayType = ko.observable('balance'); //支付方式，默认为余额支付
	self.isChangeTeacher = ko.observable(true);

	//支付类型切换事件
	self.checkPayType = function(value) {
		PayType(value);
	}
	payBox.changePay(self.checkPayType);

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
					self.clampText();
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
		if (self.isHomeWork()) {
			url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		}
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var ret = JSON.parse(responseText);
				self.balance(ret.Amount);
				if (ret.FreeCount)
					self.freeCount(ret.FreeCount);

				self.balanceGot(true);
			},
			error: function() {
				self.balanceGot(true);
			}
		});
	}

	self.confirmContinue = function() {
		var message = this;
		var msgText = '作品已找过该老师点评，是否继续？';
		var msgTitle = '点评确认';
		if (self.isHomeWork()) {
			msgText = '已交过这个作业给该老师，是否再次提交？';
			msgTitle = '交作业确认';
		}
		var btnArray = ['是', '否'];
		mui.confirm(msgText, msgTitle, btnArray, function(e) {
			if (e.index == 0) {
				self.getAmount();
			} else {
				mui.back();
			}
		});
	}

	//判断是否已存在类似的点评（相同作品和老师）
	self.checkComment = function() {
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

	//获取所有授课老师
	self.getInstructTeacher = function() {
		mui.ajax(common.gServerUrl + 'API/TeacherToStudent/TeacherToStudentList?StudentID=' + self.works().AuthorID + '&pageSize=999', {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				var teacherArrayLen = result.length;
				if (teacherArrayLen == 1) {
					self.teacher(result[0]);
				} else if (teacherArrayLen > 1) {
					result.forEach(function(item) {
						if (item.SubjectID == self.works().SubjectID) {
							self.teacher(item);
						} else {
							self.teacher(result[0]);
						}
					});
				} else {
					mui.alert('还没有授课老师，快去申请吧', '', '确定', function() {
						mui.back();
					});

				}
				self.clampText();
				self.checkComment();
			}

		})
	}

	self.changeTeacher = function() {
		common.transfer('../teacher/teacherHomeWorkHeader.html', true, {
			works: self.works(),
			displayCheck: true,
			homeWork: self.isHomeWork(),
			chooseNewTeacher: true
		});
	}

	self.gotoRecharge = function() {
		common.transfer('/modules/my/recharge.html', true);
	}

	self.openPaybox = function(){
		payBox.show();
	}
	
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

			if (self.isHomeWork()) {
				type = common.gDictOrderTargetType.Homework;
			} else {
				type = common.gDictOrderTargetType.Comment;
			}

			if (orderType > 0) {
				type = orderType;
			}

			commentJson = JSON.stringify(comment);
		}

		Pay.preparePay(commentJson, self.PayType(), type,
			orderID,
			function(newOrderID, expireMinutes) {
				orderID = newOrderID;
			},
			function() {
				//mui.back();
				common.transfer('../works/WorksDetails.html', true, {
					works: self.works()
				}, false, false);
			});
	};

	//刷新余额
	window.addEventListener('refeshBalance', function(event) {
		self.getBalance();
	});

	//刷新老师
	window.addEventListener('refreshTeacher', function(event) {
		self.teacher(event.detail.teacher);
		self.checkComment();
	});

	self.clampText = function() {
		var para;
		if (self.expanded() == true) {
			para = 99999;
		} else {
			para = maxLines;
		}

		$clamp(document.getElementById('pIntroduce'), {
			clamp: para
		});
		self.expanded(!self.expanded());
	}

	mui.plusReady(function() {
		web = plus.webview.currentWebview();
		//从订单跳转过来
		if (typeof(web.order) != "undefined") {
			self.isChangeTeacher(false);
			self.Order(web.order);
			orderID = self.Order().ID;
			orderType = self.Order().TargetType;
			self.Amount(self.Order().Amount);
			self.paid(self.Order().IsFinish);
			getDataForOrder(self.Order().TargetID);
		} else {
			if (typeof(web.works) !== "undefined") {
				self.works(web.works);
				self.addtime(self.works().AddTime.split(' ')[0]);
			}
			if (typeof(web.homeWork) !== "undefined") {
				self.isHomeWork(web.homeWork);
				if (self.isHomeWork()) {
					self.getInstructTeacher();
					self.PayType('balance');
				}
				else{
					self.PayType('wxpay');
				}
			}
			if (typeof(web.teacher) !== "undefined") {
				self.teacher(web.teacher);
				self.clampText();
				self.checkComment();
			}
			/*else{
							self.getInstructTeacher();
						}*/
			if (typeof web.isChangeTeacher !== 'undefined') {
				self.isChangeTeacher(web.isChangeTeacher);
			}

		}
		self.getBalance();
		payBox.selectPay(self.PayType());
	});

}
ko.applyBindings(submitComment);