var payBox = new PayBox('PayBox', 2, {
		"wxpay": "true",
		"alipay": "true",
		"balance": "true",
		"free": "false"
	}, {
		"discountText": "ko.observable('无折扣')",
		"balanceText": "balance",
		"freeTimesText": "ko.observable(0)",
		"pricePay": "ExamFee",
		"price": "ExamFee"
	}, true, 'gotoPay');

var examEnroll = function() {
	var self = this;
	
	self.UserName = ko.observable(''); //姓名
	self.PinYin = ko.observable(''); //姓名报名
	self.Phone = ko.observable(''); //联系电话
	self.Nationality = ko.observable(''); //国籍
	self.GenderText = ko.observable('请选择性别'); //性别
	self.Gender = ko.observable(-1); //性别value
	self.Birthday = ko.observable('请选择出生日期'); //出生日期
	self.Nation = ko.observable(''); //民族
	self.Specialty = ko.observable('请选择报考专业'); //报考专业
	self.ExamFee = ko.observable(''); //考级费用
	self.UserLevel = ko.observable('请选择已获级别'); //已获级别
	self.UserLevelId = ko.observable(''); //已获级别id
	self.ExamLevel = ko.observable('请选择报考级别'); //报考级别
	self.ExamLevelId = ko.observable(''); //报考级别id
	self.TeacherName = ko.observable(''); //指导老师姓名
	self.TeacherPhone = ko.observable(''); //指导老师电话
	self.ExamID = ko.observable(''); //考级表id
	self.enrollId = ko.observable(0); //考评记录id
	self.isSetEnroll = ko.observable(false);

	self.fromList = ko.observable(false); //从报名记录跳转而来
	self.enrollList = ko.observableArray([]); //考级信息数组
	self.balance = ko.observable(0); //余额

	//考级订单信息
	//self.examAmount=ko.observable(0);//考评价格
	self.PayType = ko.observable('wxpay'); //默认为微信支付
	self.checkPayType = function(value) {
		PayType(value);
		console.log(self.PayType());
	}
	payBox.changePay(self.checkPayType);

	//保存报名信息
	self.saveEnroll = function() {
		if (common.StrIsNull(self.UserName()) == "") {
			mui.toast("姓名不能为空");
			return;
		}
		if (common.StrIsNull(self.PinYin()) == "") {
			mui.toast("姓名拼音不能为空");
			return;
		}

		if (common.StrIsNull(self.Phone()) == "") {
			mui.toast("联系电话不能为空");
			return;
		}
		if (!common.isPhone(self.Phone())) {
			mui.toast("请输入正确的联系电话");
			return;
		}
		if (common.StrIsNull(self.Nationality()) == "") {
			mui.toast("国籍不能为空");
			return;
		}
		if (self.Gender() < 0) {
			mui.toast("性别不能为空");
			return;
		}
		if (common.StrIsNull(self.Birthday()) == "请选择出生日期") {
			mui.toast("出生日期不能为空");
			return;
		}
		if (common.StrIsNull(self.Nation()) == "") {
			mui.toast("民族不能为空");
			return;
		}
		if (common.StrIsNull(self.Specialty()) == "请选择报考专业") {
			mui.toast("报考专业不能为空");
			return;
		}
		if (common.StrIsNull(self.UserLevel()) == "请选择已获级别") {
			mui.toast("已获级别不能为空");
			return;
		}
		if (common.StrIsNull(self.ExamLevel()) == "请选择报考级别") {
			mui.toast("报考级别不能为空");
			return;
		}
		if (common.StrIsNull(self.TeacherName()) == "") {
			mui.toast("指导老师姓名不能为空");
			return;
		}
		if (common.StrIsNull(self.TeacherPhone()) == "") {
			mui.toast("指导老师电话不能为空");
			return;
		}
		if (!common.isPhone(self.TeacherPhone())) {
			mui.toast("请输入正确的指导老师电话");
			return;
		}
		if (self.UserLevelId() >= self.ExamLevelId()) {
			mui.toast("请选择正确的报考级别");
			return;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		var data = {
				UserID: getLocalItem('UserID'),
				UserName: self.UserName(),
				PinYin: self.PinYin(),
				Phone: self.Phone(),
				Nationality: self.Nationality(),
				Gender: self.Gender(),
				Birthday: self.Birthday(),
				Nation: self.Nation(),
				ExamFee: self.ExamFee(),
				ExamID: self.ExamID(),
				Specialty: self.Specialty(),
				UserLevel: self.UserLevelId(),
				ExamLevel: self.ExamLevelId(),
				TeacherName: self.TeacherName(),
				TeacherPhone: self.TeacherPhone()
			}
			//console.log("118"+JSON.stringify(data));

		if (self.enrollId() <= 0) {
			mui.ajax(common.gServerUrl + "/API/ExamToUser", {
				type: "POST",
				data: data,
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					//console.log(result.ID);
					self.enrollId(result.ID)
					var btnArray = ['是', '否'];
					mui.confirm('是否在线缴纳报名费', '报名信息保存成功', btnArray, function(e) {
						if (e.index == 0) {
							payBox.show();
						} else {
							common.transfer('examEnrollList.html', true, {
								examid: self.ExamID()
							})
							//mui.back();
						}
					});

					//mui.back();
				}
			})
		} else {
			payBox.show();
			common.setEnabled(evt);
		}

	}

	window.addEventListener('disableReset', function() {
		mui.toast('不可以修改信息~~');
	})

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
		var obj = {ID: self.enrollId()};
		
		//self.enrollId()为报名ID，先完成报名后付费，不可能为空，因此无需订单ID
		Pay.preparePay(JSON.stringify(obj), self.PayType(), common.gDictOrderTargetType.Exam, 
			0, function(newOrderID){
				//orderID = newOrderID;
			}, function(){
				mui.back();
			});
	}

	//性别设置
	self.setGender = function() {
		if (self.isSetEnroll()) {
			mui.toast('不可以更改了..');
			return;
		}
		mui.plusReady(function() {
			self.genders.show(function(items) {
				self.GenderText(items[0].text);
				self.Gender(items[0].value);
			});
		});
	}

	//生日获取
	self.getBirthday = function() {
		if (self.isSetEnroll()) {
			mui.toast('不可以更改了..');
			return;
		}
		mui.plusReady(function() {
			//console.log(self.Birthday());
			var now = new Date();
			var year = 2000 + now.getYear() % 100;

			var tmpDate = self.Birthday();
			if (isNaN(newDate(tmpDate))) {
				tmpDate = (year - 10).toString() + '-01-01';
			}

			dtPicker.PopupDtPicker({
					'type': 'date',
					'beginYear': 1900,
					'endYear': year - 1
				},
				tmpDate,
				function(value) {
					//self.Birthday(value.format('yyyy-MM-dd'));
					self.Birthday(value.split(' ')[0]);
				});
		});

	}

	//报考专业
	self.getSpecialty = function() {
		if (self.isSetEnroll()) {
			mui.toast('不可以更改了..');
			return;
		}
		mui.plusReady(function() {
			self.examSubject.show(function(items) {
				self.Specialty(items[0].text);

			});
		});
	}

	//已获级别
	self.getUserLevel = function() {
		if (self.isSetEnroll()) {
			mui.toast('不可以更改了..');
			return;
		}
		mui.plusReady(function() {
			self.userGrade.show(function(items) {
				self.UserLevel(items[0].text);
				common.gExamGrade.forEach(function(item) {
					if (item.text == self.UserLevel()) {
						self.UserLevelId(item.value);
					}
				})
			});
		});
	}

	//报考级别
	self.getExamLevel = function() {
		if (self.isSetEnroll()) {
			mui.toast('不可以更改了..');
			return;
		}
		mui.plusReady(function() {
			self.examGrade.show(function(items) {
				self.ExamLevel(items[0].text);
				self.ExamFee(items[0].value);
				common.gExamGrade.forEach(function(item) {
					if (item.text == self.ExamLevel()) {
						self.ExamLevelId(item.value);
					}
				})
			});
		});
	}

	//报名记录页面跳转至，补全报名信息
	self.setEnroll = function(data) {
		self.enrollId(data.ID);
		self.UserName(data.UserName); //姓名
		self.PinYin(data.PinYin); //姓名报名
		self.Phone(data.Phone); //联系电话
		self.Nationality(data.Nationality); //国籍
		self.GenderText(common.gJsonGenderType[data.Gender].text); //性别
		self.Gender(data.Gender); //性别value
		self.Birthday(data.Birthday); //出生日期
		self.Nation(data.Nation); //民族
		self.Specialty(data.Specialty); //报考专业
		self.ExamFee(data.ExamFee); //考级费用
		self.UserLevel(common.gExamGrade[Number(data.UserLevel)].text); //已获级别
		self.UserLevelId(data.UserLevel); //已获级别id
		self.ExamLevel(common.gExamGrade[Number(data.ExamLevel)].text); //报考级别
		self.ExamLevelId(data.ExamLevel); //报考级别id
		self.TeacherName(data.TeacherName); //指导老师姓名
		self.TeacherPhone(data.TeacherPhone); //指导老师电话
		self.ExamID(data.ExamID); //考级表id
	}

	var genders, examSubject, userGrade, examGrade;
	var thiswebview;
	mui.plusReady(function() {
		//console.log(11);
		self.getBalance();
		self.genders = new mui.PopPicker(); //性别
		self.genders.setData(common.gJsonGenderType); //性别

		self.examSubject = new mui.PopPicker(); //报考专业
		thiswebview = plus.webview.currentWebview();
		//console.log(thiswebview.subjectArray+"~"+thiswebview.examid+"~"+thiswebview.ExamFee);
		if (typeof(thiswebview.subjectArray) != "undefined") {
			self.examSubject.setData(common.JsonConvert(thiswebview.subjectArray, "SubID", "SubName"));

		}

		//报考表id
		if (typeof(thiswebview.examid) != "undefined") {
			self.ExamID(thiswebview.examid);
		}

		//已有级别
		self.userGrade = new mui.PopPicker(); //音乐级别/考评级别
		if (typeof(thiswebview.ExamFee) != "undefined") {
			var arrTmp = JSON.parse(thiswebview.ExamFee);
			arrTmp.sort(function(a, b) {
				return Number(a.Id) > Number(b.Id) ? 1 : -1;
			})

			arrTmp.unshift({
				"Id": 0,
				"Level": "无",
				"TotalFee": 0
			});

			//  text-级别  value-总价
			var arr = common.JsonConvert(arrTmp, "TotalFee", "Level");
			self.userGrade.setData(arr);
		}

		//已有级别
		self.examGrade = new mui.PopPicker(); //音乐级别/考评级别
		if (typeof(thiswebview.ExamFee) != "undefined") {
			var arrTmp = JSON.parse(thiswebview.ExamFee);
			arrTmp.sort(function(a, b) {
				return Number(a.Id) > Number(b.Id) ? 1 : -1;

			})

			//  text-级别  value-总价
			var arr = common.JsonConvert(arrTmp, "TotalFee", "Level");
			self.examGrade.setData(arr);
		}

		//从报名页面跳转回来修改
		if (typeof(thiswebview.examEnrollData) != "undefined") {
			self.setEnroll(thiswebview.examEnrollData);
			//console.log(JSON.stringify(self.enrollId()));
			self.isSetEnroll(true);
		}

		if (typeof(thiswebview.fromList) != "undefined") {
			self.fromList(true);
		}
		
		payBox.selectPay(self.PayType());
	})

	var old_back = mui.back;
	mui.back = function() {
		old_back();
		plus.webview.currentWebview().reload();
		//console.log(JSON.stringify(plus.webview.currentWebview().opener()));
	}

	mui.init({
		beforeback: function() {
			var pp = plus.webview.currentWebview().opener();

			if (self.fromList()) {
				mui.fire(pp, 'refreshList', {
					examid: self.ExamID()
				})
			} else {
				mui.fire(pp, 'refreshEnroll', {
					IsUserStat: true,
					enrollId: self.enrollId()
				});

			}
			return true;
		}
	})
}
ko.applyBindings(examEnroll);