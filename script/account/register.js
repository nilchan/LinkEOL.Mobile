var register = function() {
	var cleanvalue = "";
	var placeSelected = false; //位置是否已选择
	var ID;

	self.UserTypeText = ko.observable("请选择用户类型");
	self.UserName = ko.observable(""); //用户名，即手机号
	self.Password = ko.observable(""); //密码
	self.CheckNum = ko.observable(""); //验证码
	self.ConPassword = ko.observable(""); //确认密码
	self.UserType = ko.observable(0); //用户类型
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.Agreed = ko.observable(true); //同意协议
	self.registerTitle = ko.observable('注册');
	self.placeholderValue=ko.observable('请输入你的姓名');
	self.isFalseGetTeacher=ko.observable(false);//验证码是否正确获取老师
	self.teacherInfo=ko.observableArray([]);//老师详情数组
	self.inviteCodeStyle=ko.observable('reg-code-error');//邀请码提示语样式，默认为false样式
	self.inviteCodeText=ko.observable('邀请码无效');//邀请码提示语
	self.placeholderText=ko.observable('请输入邀请码(若无可不填)');
	self.showVerify = ko.observable(true);

	/*
	 * registerInfo 相关绑定
	 */
	self.UserType = ko.observable(''); //用户类型
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable(''); //头像
	self.Birthday = ko.observable('请选择生日'); //生日
	self.Gender = ko.observable(0); //性别
	self.GenderText = ko.observable('男'); //性别文本
	self.Province = ko.observable("请选择位置");
	self.City = ko.observable("");
	self.District = ko.observable("");
	self.Place = ko.computed(function() { //位置
		return self.Province() + ' ' + self.City() + ' ' + self.District();
	});
	self.SubjectName = ko.observable('请选择科目'); //所属科目名称
	self.SubjectID = ko.observable(0); //所属科目
	self.TeachAge = ko.observable("0"); //教龄
	self.Introduce = ko.observable(''); //简介
	self.Path = ko.observable('../../images/my-default.png'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串
	//头像裁剪
	self.selectPic = function() {
		picture.SelectPicture(true, false, function(retValue) {
			self.Base64(retValue[0].Base64);
			self.Path(self.Base64());
		}); //需要裁剪

	}

	//用户类型选择
	self.setUserType = function() {
		/*if (ID) {
			mui.toast('活动只允许学习报名!');
			return;
		}*/
		userType.show(function(items) {
			self.UserTypeText(items[0].text);
			self.UserType(items[0].value);
			if(self.UserType()==common.gDictUserType.teacher){
				self.placeholderValue("请输入你的真实姓名");
				self.placeholderText('请输入邀请码(可不填)');
			}
		});
		
	}

	//验证码获取
	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		if (self.UserName() == "") {
			mui.toast('手机号不能为空');
		} else if (!common.isPhone(self.UserName())) {
			mui.toast("手机号码不合法")
		} else {
			//账号是否存在,此处不存在success
			self.RemainTime(common.gVarWaitingSeconds);
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName() + "&exists=false", {
				type: 'GET',
				success: function(responseText) {
					mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.UserName(), {
						type: 'GET',
						success: function(responseText) {
							mui.toast(responseText);
							self.CheckTime();
						},
						error: function() {
							self.RemainTime(0);
						}
					})
				},
				error: function() {
					self.RemainTime(0);
				}
			})
		}
	}

	//验证码计时器
	self.CheckTime = function() {
		if (self.RemainTime() == 0) {
			return;
		} else {
			self.RemainTime(self.RemainTime() - 1);
			setTimeout(function() {
				self.CheckTime()
			}, 1000);
		}
	}
	
	//根据邀请码获取老师
	var timeEvent;
	var inviteCode='';
	self.getTeacher=function(){
		clearTimeout(timeEvent);
		timeEvent=setTimeout(function(){
			inviteCode=document.getElementById("inviteCode").value;
			if(inviteCode.length<=0){
				self.isFalseGetTeacher(false);
				return ;
			}
			var ajaxUrl=common.gServerUrl+'API/Teacher/GetTeacherInfoByInviteCode?inviteCode='+inviteCode;
			mui.ajax(ajaxUrl,{
				type:'GET',
				success:function(responseText){
					if(common.StrIsNull(responseText)!='' && responseText.length>0){
						//邀请码正确且有返回内容
						self.teacherInfo(JSON.parse(responseText));
						self.inviteCodeText('这是'+self.teacherInfo().DisplayName+'的邀请码');
						self.inviteCodeStyle('reg-code-right')
						self.isFalseGetTeacher(true);
					}else{
						self.inviteCodeStyle('reg-code-error')
						self.inviteCodeText('邀请码无效');
						self.isFalseGetTeacher(true);//获取为空
					}
				},
				error:function(){
					self.inviteCodeStyle('reg-code-error');
					self.inviteCodeText('邀请码无效');
					self.isFalseGetTeacher(true);
				}
			})
		},500);
	}

	//注册按钮实现
	self.registerUser = function() {
		if (self.UserType() <= 0) {
			mui.toast('请选择用户类型');
			return;
		}
		if (self.UserName() == "") {
			mui.toast('手机号不能为空');
			return;
		}
		if (self.CheckNum() == "" && self.showVerify()) {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.Password() == "") {
			mui.toast('密码不能为空');
			return;
		}
		if (common.StrIsNull(self.DisplayName()) == "") {
			mui.toast('姓名不能为空');
			return;
		}
		if(self.UserType()==common.gDictUserType.teacher && self.SubjectID() <= 0){
			mui.toast('科目不能为空');
			return;
		}
		
		if (self.Agreed() == false) {
			mui.toast('请阅读并同意服务协议');
			return;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		var data = {
			UserName: self.UserName(),
			DisplayName: self.DisplayName(),
			Password: self.Password(),
			UserType: self.UserType(),
			VerifyCode: self.CheckNum(),
			InviteCode:inviteCode,
			Province: decodeURI(self.Province()),
			City: decodeURI(self.City()),
			District: decodeURI(self.District())
		};
		if(common.gDictUserType.teacher==self.UserType()){
			data.SubjectID=self.SubjectID();
		}
		
		if( self.showVerify() === false ) {
			data.VerifyCode = '';
		}
		
		mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName() + "&exists=false&verifyCode=" + self.CheckNum(), {
			type: "GET",
			success: function() {
				var ajaxUrl = common.gServerUrl + "API/Account/Register";
				mui.ajax(ajaxUrl, {
					type: 'POST',
					data: data,
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						console.log(JSON.stringify(result))
						setLocalItem("UserID", result.UserID);
						setLocalItem("UserName", result.UserName);
						setLocalItem("Token", result.Token);
						setLocalItem("UserType", result.UserType);
						setLocalItem('DisplayName', result.DisplayName);
						//plus.webview.close(index); //关闭首页webview
						alert(result.Tips);
						if (ID) {
							common.transfer('activityEnroll.html', false, {
								aid: ID
							});
							mui.toast('注册成功');
							return;
						}
						mui.toast("注册成功，正在返回...");
						var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //获取首页Webview对象
						plus.webview.close(index); //关闭首页
						common.transfer("../../index.html", false, {}, true, false, "indexID");
					},
					error: function() {
						console.log("this");
						common.setEnabled(evt);
					}
				});
			},
			error: function() {
					common.setEnabled(evt);
			}
		})
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
				if( items[0].value > 700000 ) {
					self.showVerify(false);
				} else {
					self.showVerify(true);
				}
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.Province(cityValueMon.split(" ")[0]);
				self.City(cityValueMon.split(" ")[1]);
				self.District(cityValueMon.split(" ")[2]);
				placeSelected = true;
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

	//提交注册
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
		if (common.StrIsNull(self.GenderText()) == "") {
			mui.toast('请选择性别');
			return;
		}
		if (!placeSelected) {
			mui.toast('请选择位置');
			return;
		}
		if (self.UserType() == common.gDictUserType.teacher) {
			if (common.StrIsNull(self.Introduce()) == "") {
				mui.toast('自我简介不能为空');
				return;
			}
		}
		if (self.UserType() == common.gDictUserType.student) {
			if (common.StrIsNull(self.Birthday()) == "") {
				mui.toast('生日不能为空');
				return;
			}
		}
		if (self.UserType() == common.gDictUserType.teacher) {
			if (common.StrIsNull(self.TeachAge()) == "") {
				mui.toast('教龄不能为空');
				return;
			}
		}

		var evt = event;
		if (!common.setDisabled()) return;

		var data = {
			UserName: self.UserName(),
			DisplayName: self.DisplayName(),
			Password: self.Password(),
			UserType: self.UserType(),
			VerifyCode: self.CheckNum(),
			Gender: self.Gender(),
			Province: decodeURI(self.Province()),
			City: decodeURI(self.City()),
			District: decodeURI(self.District()),
			Birthday: self.Birthday(),
			SubjectID: self.SubjectID(),
			TeachAge: self.TeachAge(),
			Introduce: self.Introduce(),
			InviteCode:inviteCode
		};
		if( self.showVerify() === false ) {
			data.VerifyCode = '';
		}
		mui.toast(data.Province + '~' + data.City + '~' + data.District);
		if (self.Base64() != '') {
			data.PhotoBase64 = self.Base64();
		}

		//var info = plus.push.getClientInfo();
		//var ajaxUrl = common.gServerUrl + "API/Account/Register?devicetoken="+info.token+"&clientid="+info.clientid;
		var ajaxUrl = common.gServerUrl + "API/Account/Register";
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: data,
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				setLocalItem("UserID", result.UserID);
				setLocalItem("UserName", result.UserName);
				setLocalItem("Token", result.Token);
				setLocalItem("UserType", result.UserType);
				setLocalItem('DisplayName', result.DisplayName);
				//plus.webview.close(index); //关闭首页webview
				if (ID) {
					common.transfer('activityEnroll.html', false, {
						aid: ID
					});
					mui.toast('注册成功');
					return;
				}
				mui.toast("注册成功，正在返回...");
				var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //获取首页Webview对象
				plus.webview.close(index); //关闭首页
				common.transfer("../../index.html", false, {}, true, false, "indexID");
			},
			error: function() {
				common.setEnabled(evt);
			}
		});
	}
	
	self.goAddWork=function(){//尚不完整
		common.transfer('../works/addWorks.html',true,{},true,true);
	}
	self.addInstuctTeacher=function(){//
		common.transfer('../teacher/teacherList.html')
	}

	//预加载数据
	var userType, genders, places, subjects;
	mui.plusReady(function() {
		userType = new mui.PopPicker();
		userType.setData([{
			value: common.gDictUserType.student,
			text: '学生'
		}, {
			value: common.gDictUserType.teacher,
			text: '老师'
		}]);
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

		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
			self.UserTypeText('学生');
		}
	});
}
ko.applyBindings(register);