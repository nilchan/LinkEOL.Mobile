var favUser = function() {
	var self = this;
	var qrcodeID, qrcodeType;
	var qrcodeWeb = null;
	self.Gendervalue = ko.observable('');
	self.userInfo = ko.observableArray([]);

	var userId = getLocalItem('UserID'); //当前用户id
	var subjectId = getLocalItem('SubjectID'); //当前用户科目id
	self.valid = ko.observable(false);
	self.isShowStudent = ko.observable(false); 	//是否显示授课学生按钮
	self.isShowTeacher = ko.observable(false); 	//是否显示授课老师按钮
	self.isShowOrg = ko.observable(false); 		//是否显示绑定机构按钮
	var isAttentionUser = false;	//是否关注成功

	mui.plusReady(function() {
		qrcodeWeb = plus.webview.currentWebview();
		if (common.StrIsNull(qrcodeWeb.result) != "") {
			var result = qrcodeWeb.result;
			var httpDomain = result.indexOf(common.gWebsiteUrl.split("//")[1]); //是否为官网数据
			//console.log(httpDomain);
			if (result.indexOf("teacher") >= 0) { //用户类型
				qrcodeType = common.gDictUserType.teacher;
				if (getLocalItem('UserType') == common.gDictUserType.student) { //学生扫码老师
					self.isShowTeacher(true);
				}
			} else if (result.indexOf("student") >= 0) {
				qrcodeType = common.gDictUserType.student;
				if (getLocalItem('UserType') == common.gDictUserType.teacher) { //老师扫码学生
					self.isShowStudent(true);
				}
			} else if (result.indexOf("org") >= 0){
				qrcodeType = common.gDictUserType.org;
				if (getLocalItem('UserType') != common.gDictUserType.org) { 	//非机构扫码机构
					self.isShowOrg(true);
				}
			}
			qrcodeID = common.getQueryStringByName("id", result); //用户id

			if (common.StrIsNull(qrcodeID) == '' || common.StrIsNull(qrcodeType) == '' || httpDomain < 0) {
				self.valid(false);
				common.showCurrentWebview();
				plus.webview.close(qrcodeWeb.opener());
			} else {
				var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + qrcodeID + "&usertype=" + qrcodeType;
				console.log(ajaxUrl);
				mui.ajax(ajaxUrl, {
					type: "GET",
					success: function(responseText) {
						if (common.StrIsNull(responseText) != '') {
							var result = eval("(" + responseText + ")");
							if(result.UserType == common.gDictUserType.teacher || 
								result.UserType == common.gDictUserType.student){
								self.Gendervalue(common.gJsonGenderType[parseInt(result.Gender)].text);
							}
							
							self.userInfo(result);
							self.valid(true);
						}
						else{
							self.valid(false);
						}
						common.showCurrentWebview();
						plus.webview.close(qrcodeWeb.opener());
					},
					error: function(){
						self.valid(false);
						common.showCurrentWebview();
						plus.webview.close(qrcodeWeb.opener());
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
			
			common.refreshMyValue({
				valueType: 'fav',
				changeValue: 1,
				count: 0
			})
		}
		plus.webview.close(qrcodeWeb.opener());
		//common.transfer('myAttention.html');
		mui.back();
	}

	//设置为我的授课老师
	self.setMyTeacher = function() {
		var instuctUrl = common.gServerUrl + 'API/TeacherToStudent/TeacherToStudentAdd';
		if (self.userInfo().SubjectID > 0) { //获取的用户存在科目信息，为老师
			instuctUrl += '?TeacherID=' + self.userInfo().UserID + '&StudentID=' + userId + 
				'&SubjectID=' + self.userInfo().SubjectID + '&type=' + common.gInstructType[0].value;
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
		instuctUrl += '?TeacherID=' + userId + '&StudentID=' + self.userInfo().UserID + 
			'&SubjectID=' + subjectId + '&type=' + common.gInstructType[1].value;
		mui.ajax(instuctUrl, {
			type: 'POST',
			success: function(responseText) {
				mui.toast('已设置成功');
				common.transfer('myStudentList.html');
			}
		})
	}
	
	//绑定机构
	self.setMyOrg = function() {
		var instuctUrl = common.gServerUrl + 'Common/Org/OrgToUserAdd';
		mui.ajax(instuctUrl, {
			type: 'POST',
			data: {
				OrgID: qrcodeID,
				UserID: userId
			},
			success: function(responseText) {
				mui.toast('已绑定成功');
				mui.back();
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