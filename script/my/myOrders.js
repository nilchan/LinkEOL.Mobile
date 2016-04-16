var myOrders = function() {
	var self = this;
	self.DisplayName = ko.observable(""); //用户名
	self.Balance = ko.observable(0); //我的余额
	self.OrdersNotPay = ko.observableArray([]); //未支付订单
	self.OrdersPayed = ko.observableArray([]); //已支付订单
	self.OrdersRefunded = ko.observableArray([]); //已退款订单
	self.Sum = ko.observable('0'); //小计
	self.Photo = ko.observable("");

	var currentID = 0;
	
	mui.init({
		gestureConfig: {
			longtap: true
		}
	})

	mui.plusReady(function() {
		var current = plus.webview.currentWebview();
		var self = this;
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + getLocalItem("UserID") + "&usertype=" + getLocalItem('UserType'), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.DisplayName(result.DisplayName);
			}
		});
		self.getBalance();
		var current = plus.webview.currentWebview();
		if (common.StrIsNull(current.Photo) != "") {
			self.Photo(current.Photo);
		}
		self.GetNotPay();
	})

	//获取账户余额
	self.getBalance = function() {
		var ajaxUrl = common.gServerUrl + 'API/AccountDetails/GetUserAmount?userid=' + getLocalItem('UserID');
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var balance = JSON.parse(responseText);
				self.Balance((balance.Amount).toFixed(2));
			}
		})
	}

	//未支付
	self.GetNotPay = function() {
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		//common.gDictAccountDetailType.NotFinish;
		mui.ajax(ajaxUrl + common.gDictOrderStatus.NotPay, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersNotPay(JSON.parse(responseText));
				//console.log(JSON.stringify(self.OrdersNotPay()));
				self.Sum(common.getArraySum(self.OrdersNotPay(), 'Amount'));
			}
		})
	}

	//已支付
	self.GetPayed = function() {
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		mui.ajax(ajaxUrl + common.gDictOrderStatus.Payed, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersPayed(JSON.parse(responseText));
				self.Sum(common.getArraySum(self.OrdersPayed(), 'Amount'));
			}
		})
	}

	//已退款
	self.GetRefunded = function() {
		var ajaxUrl = common.gServerUrl + 'API/Order/GetOrdersByType?userId=' + getLocalItem('UserID') + '&orderStatus=';
		mui.ajax(ajaxUrl + common.gDictOrderStatus.Refunded, {
			type: 'GET',
			success: function(responseText) {
				self.OrdersRefunded(JSON.parse(responseText));
				self.Sum(common.getArraySum(self.OrdersRefunded(), 'Amount'));
			}
		})
	}

	self.getOrderID = function(data) {
		currentID = data.ID;
	}

	//评分
	self.putOrderScore = function(score) {
		var ajaxUrl = common.gServerUrl + 'API/Order/MarkOrder?orderId=' + currentID + '&score=' + score;
		mui.ajax(ajaxUrl, {
			type: 'PUT',
			success: function(responseText) {
				mui.toast('评分成功');
				var arr = [];
				self.OrdersPayed().forEach(function(item) {
					if (item.ID == currentID)
						item.Score = score;
					arr.push(item);
				})
				self.OrdersPayed([]);
				self.OrdersPayed(arr);
				mui('#middlePopover').popover('toggle');
				clearOrderStar(orderStar);
				//window.location = window.location;
			}
		})
	}

	self.deleteOrder = function(order) {
		var btnArray = ['取消', '确认'];
		mui.confirm('确认删除订单？', '删除订单', btnArray, function(e) {
			if (e.index == 1) {
				var ajaxUrl=common.gServerUrl+'API/Order/OrderDel?orderId='+order.ID;
				mui.ajax(ajaxUrl,{
					type:'DELETE',
					success:function(responseText){
						self.OrdersNotPay.remove(order);
						self.Sum(common.getArraySum(self.OrdersNotPay(), 'Amount'));
					}
				})
			}
		});
	}

	self.goDetail = function(order) {
		//console.log(JSON.stringify(order));
		var url = '', arg1 = true, arg2 = true;
		switch (order.TargetType) {
			case common.gDictOrderTargetType.Comment:
				url = '../../modules/student/submitComment.html';
				break;
			case common.gDictOrderTargetType.CourseToUser:
				url = '../../modules/student/aboutLesson.html';
				break;
			case common.gDictOrderTargetType.Download:
				//url = '../../modules/works/worksDetails.html';
				url = '../../modules/works/WorksDetails.html';
				break;
			case common.gDictOrderTargetType.Ticket:
				url = '../../modules/activity/saleTicket.html';
				break;
			case common.gDictOrderTargetType.Homework:
				url = '../../modules/student/submitComment.html';
				break;
			case common.gDictOrderTargetType.RegGame:
				url = '../../modules/activity/XSBRegister/apply.html';
				arg1 = false;
				arg2 = false;
				break;
			case common.gDictOrderTargetType.RegLectures:
				url = '../../modules/activity/teacherFTF/apply.html';
				arg1 = false;
				arg2 = false;
				break;
			case common.gDictOrderTargetType.TbPay:
				url = '../../modules/my/recharge.html';
				break;
			default:
				return;
		}
		common.transfer(url, true, {
			order: order
		}, arg1, arg2);
	}

	window.addEventListener('refreshOrderInfo', function() {
		self.GetNotPay();
		self.GetPayed();
		self.getBalance();
	})

	//提现
	self.Withdraw = function() {
		common.transfer("myCard.html", false);
	}
	var count = 0;
	self.pullupRefresh = function() {
		this.endPullUpToRefresh((++count > 2));
	}

	//星级评分
	var orderStar = document.getElementById('orderstar').getElementsByTagName('i');

	//清除分数
	function clearOrderStar(ele) {
		for (var i = 0; i < ele.length; i++) {
			ele[i].className = ele[i].className.replace(/orderSelect/g, "");
		}
	}

	//选择分数
	function selectOrderStar(ele, idx) {
		for (var i = 0; i <= idx; i++) {
			ele[i].className += " orderSelect";
		}
	}

	//批量绑定
	for (var i in orderStar) {
		(function(j) {
			orderStar[j].onclick = function() {
				clearOrderStar(orderStar);
				selectOrderStar(orderStar, j);
			};
		})(i);
	}

	//统计分数
	document.getElementById('orderSubmit').onclick = function() {
		var count = 0;
		for (var i = 0; i < orderStar.length; i++) {
			if (orderStar[i].className.indexOf('orderSelect') > 0) {
				count++;
			}
		}
		if (count === 0) {
			mui.toast('请选择分数(不能为0分)');
			return false;
		}
		self.putOrderScore(count);
	}
}
ko.applyBindings(myOrders);