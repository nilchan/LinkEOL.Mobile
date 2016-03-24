var myInfo = function() {
	var self = this;
	var bValue = false;
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable('');
	self.UserType(getLocalItem('UserType'));

	self.IsRegister = ko.observable(false);

	//self.ID = ko.observable(" ");.//用户id
	self.UserName = ko.observable(getLocalItem('UserName')); //手机
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable(''); //头像
	self.Birthday = ko.observable(''); //生日
	self.Gender = ko.observable(0); //性别
	self.GenderText = ko.observable('选择性别'); //性别文本
	self.Province = ko.observable("广东省"); //默认广东省
	self.City = ko.observable("广州市"); //默认广州市
	self.District = ko.observable("天河区"); //默认天河区
	self.Place = ko.computed(function() { //位置
		return self.Province() + ' ' + self.City() + ' ' + self.District();
	})

	self.IDAuthApproved = ko.observable(0);
	self.IDAuth = ko.observable(false); //id认证
	self.hasNewMessage = ko.observable(false); //有新消息
	self.auths = ko.observableArray([]); //认证数组
	self.SubjectName = ko.observable('请选择科目'); //所属科目名称
	self.SubjectID = ko.observable(0); //所属科目
	self.TeachAge = ko.observable(0); //教龄
	self.Introduce = ko.observable(''); //简介
	self.Path = ko.observable('../../images/my-default.png'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串
	self.Score = ko.observable(''); //老师得分

	self.selectPic = function() {
		picture.SelectPicture(true, false, function(retValue) {
			self.Base64(retValue[0].Base64);
			self.Path(self.Base64());
		}); //需要裁剪

	}

	//性别获取
	self.setUserGender = function() {
		mui.plusReady(function() {
			self.genders.show(function(items) {
				self.GenderText(items[0].text);
				self.Gender(items[0].value);
			});
		});
	}

	//生日获取
	self.getBirthday = function() {
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

	//地址获取
	self.address = function() {
		mui.plusReady(function() {
			self.places.show(function(items) {
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.Province(cityValueMon.split(" ")[0]);
				self.City(cityValueMon.split(" ")[1]);
				self.District(cityValueMon.split(" ")[2]);
				console.log(self.District());
			});
		})
	}

	//科目获取
	self.getSubject = function() {
		mui.plusReady(function() {
			self.subjects.show(function(items) {
				self.SubjectName(items[1].text);
				self.SubjectID(items[1].value);
			});
		});
	}
	var genders, places, subjects, useLocation;
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		
		self.genders = new mui.PopPicker();
		self.genders.setData(common.gJsonGenderType);

		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);
		self.subjects = new mui.PopPicker({
			layer: 2
		});
		self.subjects.setData(common.getAllSubjectsBoth());

		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType(), {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				if (responseText != "") {
					var result = eval("(" + responseText + ")");
					self.initData(result);
					common.showCurrentWebview();
				}
			}
		})
	})
	self.initData = function(result) {
		//self.UserName(result.UserName);
		self.DisplayName(result.DisplayName);
		self.Photo(result.Photo);
		if (common.StrIsNull(result.Photo) != '')
			self.Path(common.getPhotoUrl(result.Photo));
		if (result.Birthday)
			self.Birthday(result.Birthday.split(" ")[0]);
		if (typeof result.Gender == 'number') {
			self.Gender(result.Gender);
			self.GenderText(common.getTextByValue(common.gJsonGenderType, result.Gender));
		}
		if (result.SubjectID) {
			self.SubjectID(result.SubjectID);
			self.SubjectName(result.SubjectName);
		}
		if (result.TeachAge)
			self.TeachAge(result.TeachAge);
		if (result.Score)
			self.Score(result.Score);
		if (result.Province && common.StrIsNull(result.Province) != '')
			self.Province(result.Province);
		if (result.City && common.StrIsNull(result.City) != '')
			self.City(result.City);
		if (result.District && common.StrIsNull(result.District) != '') {
			self.District(result.District);
		} else {
			self.District('');
		}
		/*self.Province(common.StrIsNull(result.Province));
		self.City(common.StrIsNull(result.City));
		self.District(common.StrIsNull(result.District));*/
		self.Introduce(common.StrIsNull(result.Introduce));
		if (result.IDAuth && common.StrIsNull(result.IDAuth) != '')
			self.IDAuth(result.IDAuth);
	}

	self.changeUserName = function() {
		common.transfer('modifyPhone.html', true);
	}

	self.goAuth = function() { //资料认证
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
		if (!self.hasNewMessage() && UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed == IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatusFalse', {});
		}
		common.transfer('teacherAuth.html', true, {
			authMessage: self.auths()
		}, false, false);
	}
	self.getMyAuth = function() { //获取我的认证
		mui.ajax(common.gServerUrl + "API/TeacherAuth?userId=" + getLocalItem('UserID'), {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.auths(responseText);
				if (responseText && responseText.length > 0) {
					responseText.forEach(function(item) {
						switch (item.AuthType) {
							case common.gDictTeacherAuthType.IDAuth:
								{
									self.IDAuthApproved(item.Approved);
								}
								break;
						}
					});
					if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed != self.IDAuthApproved()) {
						var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
						mui.fire(index, 'refreshMessageStatus', {});
					}
				} else {
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
					mui.fire(index, 'refreshMessageStatus', {});
				}
			}
		})
	}

	//提交修改
	self.setInfo = function() {
		if (common.StrIsNull(self.DisplayName()) == "") {
			mui.toast('姓名不能为空');
			return;
		}
		if (self.UserType() == common.gDictUserType.teacher) {
			if (self.SubjectID() <= 0) {
				mui.toast('请选择科目');
				return;
			}
		}
		/*if (common.StrIsNull(self.GenderText()) == "") {
			mui.toast('请选择性别');
			return;
		}
		if (common.StrIsNull(self.Province()) == "") {
			mui.toast('请选择位置');
			return;
		}*/
		/*if (self.UserType() == common.gDictUserType.teacher) {
			if (common.StrIsNull(self.Introduce()) == "") {
				mui.toast('自我简介不能为空');
				return;
			}
		}*/

		if (self.Province() == 'undefined' || self.City() == 'undefined' || self.District() == 'undefined') {
			mui.toast('请选择正确的地址');
			return;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		var infoUrl;
		var data = {
			DisplayName: self.DisplayName(),
			Gender: self.Gender(),
			Province: self.Province(),
			City: self.City(),
			District: self.District()
		};
		if (self.Base64() != '') {
			data.PhotoBase64 = self.Base64();
		}
		if (self.UserType() == common.gDictUserType.student) {
			infoUrl = common.gServerUrl + "API/Student?userID=";
			data.Birthday = self.Birthday();
		} else {
			infoUrl = common.gServerUrl + "Common/Teacher?userID=";
			data.SubjectID = self.SubjectID();
			data.TeachAge = self.TeachAge();
			data.Introduce = self.Introduce();
		}
		plus.nativeUI.showWaiting();
		mui.ajax(infoUrl + self.UserID(), {
			type: "PUT",
			//contentType: 'application/json',
			data: data,
			success: function(responseText) {
				setLocalItem('SubjectID', self.SubjectID());
				mui.toast("修改成功");
				plus.nativeUI.closeWaiting();
				bValue = true;
				mui.back();
			},
			error: function() {
				common.setEnabled(evt);
			}
		})
	}

	mui.init({
		beforeback: function() {
			var myinfo = plus.webview.currentWebview().opener();
			var infoArray = {
				IDAuth: self.IDAuth()
			};
			if (bValue) {
				infoArray['imgPath'] = self.Path();
				infoArray['displayName'] = self.DisplayName();
				infoArray['userScore'] = self.Score();
				infoArray['Province'] = self.Province();
				infoArray['City'] = self.City();
				infoArray['District'] = self.District();
			}
			mui.fire(myinfo, 'refreshMyinfo', infoArray);
			return true;
		}
	})

	window.addEventListener('refreshUserName', function(event) {
		self.UserName(getLocalItem('UserName'));
	})
	window.addEventListener('refreshAuth', function(event) {
		if (common.StrIsNull(event.detail.auths) != '') {
			self.IDAuth(event.detail.auths[0].Approved == common.gDictAuthStatusType.Authed);
		}
	})

}
ko.applyBindings(myInfo);