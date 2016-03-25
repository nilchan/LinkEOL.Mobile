var AboutLesson = {
	lessonBaseInfo: LessonBaseInfo,
	lessonChosenTimes: LessonChosenTimes
};

//支付方式，默认为微信支付
var PayType = ko.observable('wxpay');
var checkPayType = function() {
	PayType(event.srcElement.value);
}

var Order = ko.observable({}); //由我的订单传递过来的订单参数
var ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
var OrderNO = ko.observable(''); //请求后返回的订单号
//支付的生成订单
var gotoPay = function() {
	var ajaxUrl;
	
	//支付方式的数值
	var paytype = 3;
	if (self.PayType() == 'wxpay') {
		paytype = 1;
	} else if (self.PayType() == 'alipay') {
		paytype = 2;
	} else {
		paytype = 3;
	}

	if (!self.ViewOrder()) { //不是由我的订单跳转而来
		if (!self.selectedCourse()) {
			mui.toast("请选择课程");
			return;
		}
		if (!self.selectedLocation()) {
			mui.toast("请选择授课方式");
			return;
		}
		if (self.ChosenTimes().length <= 0) {
			mui.toast("请选择课时");
			return;
		}
		if (self.PayType() == '') {
			mui.toast("请选择支付方式");
			return;
		}

		//准备约课信息
		var courseToUser = {
			CourseID: self.selectedCourse().ID,
			CourseName: self.selectedCourse().CourseName,
			TeacherID: self.teacherID(),
			StudentID: getLocalItem('UserID'),
			LessonCount: self.ChosenTimes().length
		}

		//准备课时信息
		var lessons = [];
		self.ChosenTimes().forEach(function(item) {
			var dtEnd = newDate(item);
			dtEnd.setHours(dtEnd.getHours() + 1);
			var endtime = dtEnd.format("yyyy-MM-dd hh:mm:ss");
			var lesson = {
				LocationType: self.selectedLocation().LocationType,
				LocationName: self.selectedLocation().LocationName,
				BeginTime: item,
				EndTime: endtime,
				Amount: self.selectedLocation().Cost
			}

			lessons.push(lesson);
		})

		ajaxUrl = common.gServerUrl + 'API/CourseToUser?payType=' + paytype + '&lessonJson=' + JSON.stringify(lessons);
	}
	else{
		ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + self.Order().ID + '&payType=' + paytype;
	}

	plus.nativeUI.showWaiting();
	//新增则保存约课及课时信息；修改则保存新的支付方式。均返回订单信息
	mui.ajax(ajaxUrl, {
		type: 'POST',
		data: self.ViewOrder() ? self.Order() : courseToUser,
		success: function(responseText) {	//responseText为微信支付所需的json
			var ret = JSON.parse(responseText);
			var orderID = ret.orderID;
			var requestJson = JSON.stringify(ret.requestJson);

			//根据支付方式、订单信息，调用支付操作
			Pay.pay(self.PayType(), requestJson, function(tradeno){	//成功后的回调函数
				var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id='+orderID+'&otherOrderNO='+tradeno;
				mui.ajax(aurl,{
					type: 'PUT',
					success:function(respText){
						var lessons = JSON.parse(respText);
						if(lessons.length > 0){
							//跳转至约课的课时（打开第一个）
							common.transfer("../../modules/course/myCourse.html", true, {
								lessonID: lessons[0].ID
							});
							plus.nativeUI.closeWaiting();
						}
					}
				})
			}, function(){
				plus.nativeUI.closeWaiting();
			});
		}
	})
};

//关闭支付弹窗
var closePopPay = function() {
	mui('#popPay').popover('hide');
}

//关闭选择课时弹窗
var closePopChooseTime = function() {
	mui('#popChooseTime').popover('hide');
}

ko.applyBindings(AboutLesson);