var favUser = function() {
	var self = this;
	var qrcodeID, qrcodeType;
	var qrcodeWeb = null;
	self.Gendervalue = ko.observable('男')
	self.userInfo = ko.observableArray([]);
	var infoUrl = "API/Account/GetInfo?userid=";
	var infoType = "&usertype=";
	var teacherUrl = '?TeacherID=';
	var studentUrl = '&StudentID=';
	var SubjectUrl = '&SubjectID=';
	var typeUrl = '&type=';
	var userId = getLocalItem('UserID'); //当前用户id
	var subjectId = getLocalItem('SubjectID'); //当前用户科目id
	self.valid = ko.observable(true);
	self.isTrueInstruct = ko.observable(true); //是否能正确设置授课关系 ,只有在学生关注学生打开此页面的时候为false
	self.isShowTeacher = ko.observable(true); //是否显示授课老师按钮
	var isAttentionUser = ko.observable(false);//是否关注成功

	mui.plusReady(function() {
		qrcodeWeb = plus.webview.currentWebview();
		if (common.StrIsNull(qrcodeWeb.result) != "") {
			var result = qrcodeWeb.result;
			var httpDomain = result.indexOf(common.gWebsiteUrl.split("//")[1]); //是否为官网数据
			//console.log(httpDomain);
			if (result.indexOf("teacher") >= 0) { //用户类型
				qrcodeType = common.gDictUserType.teacher;
				if (getLocalItem('UserType') == common.gDictUserType.student) { //学生打开老师关注页
					self.isTrueInstruct(false);
				}
			} else if (result.indexOf("student") >= 0) {
				qrcodeType = common.gDictUserType.student;
				self.isShowTeacher(false);
				if (getLocalItem('UserType') == qrcodeType) { //学生打开学生的此页
					self.isTrueInstruct(false);
				}
			}
			qrcodeID = common.getQueryStringByName("id", result); //用户id

			if (common.StrIsNull(qrcodeID) == '' || common.StrIsNull(qrcodeType) == '' || httpDomain < 0) {
				self.valid(true);
				common.showCurrentWebview();
				plus.webview.close(qrcodeWeb.opener());
				//qrcodeWeb.evalJS("closeScan()");
			} else {
				mui.ajax(common.gServerUrl + infoUrl + qrcodeID + infoType + qrcodeType, {
					type: "GET",
					success: function(responseText) {
						if (responseText != "") {
							var result = eval("(" + responseText + ")");
							//console.log(JSON.stringify(result));
							self.Gendervalue(common.gJsonGenderType[parseInt(result.Gender)].text);
							self.userInfo(result);
							self.valid(false);
							common.showCurrentWebview();
							plus.webview.close(qrcodeWeb.opener());
							//qrcodeWeb.evalJS("closeScan()");
						}
					}
				})
			}

		}
	});

	//设置为我的关注
	self.addMyAttention = function() {
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, qrcodeID);
		if (ret) {
			mui.toast('关注成功');
			isAttentionUser = true;
		}
		plus.webview.close(qrcodeWeb.opener());
		//common.transfer('myAttention.html');
		mui.back();
	}

	//设置为我的授课老师
	self.setMyTeacher = function() {
		var instuctUrl = common.gServerUrl + 'API/TeacherToStudent/TeacherToStudentAdd';
		if (self.userInfo().SubjectID > 0) { //获取的用户存在科目信息，为老师
			instuctUrl += teacherUrl + self.userInfo().UserID + studentUrl + userId + SubjectUrl + self.userInfo().SubjectID + typeUrl + common.gInstructType[0].value;
			mui.ajax(instuctUrl, {
				type: 'POST',
				success: function(responseText) {
					mui.toast('成功提交申请，请留意通知');
					common.transfer('myTeacherList.html');
				}
			})
		}
	}

	//设置为我的授课学生
	self.setMyStudent = function() {
		var instuctUrl = common.gServerUrl + 'API/TeacherToStudent/TeacherToStudentAdd';
		instuctUrl += teacherUrl + userId + studentUrl + self.userInfo().UserID + SubjectUrl + subjectId + typeUrl + common.gInstructType[1].value;
		mui.ajax(instuctUrl, {
			type: 'POST',
			success: function(responseText) {
				mui.toast('已设置成功');
				common.transfer('myStudentList.html');
			}
		})
	}
	
	self.goInfo=function(){
		
	}

	mui.init({
		beforeback: function() {
			var pp = plus.webview.getWebviewById('myAttention.html');
			if (isAttentionUser) {//成功关注才刷新关注列表
				mui.fire(pp, 'refreshAttention', {
					userInfo: self.userInfo()
				});
			}
			return true;
		}
	})

	var old_back = mui.back;
	mui.back = function() {
		plus.webview.close(qrcodeWeb.opener());
		old_back();
	}
}
ko.applyBindings(favUser);