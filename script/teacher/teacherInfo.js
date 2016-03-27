var teacherInfo = function() {
	var self = this;

	self.teacherInfo = ko.observable(); //老师详情对象
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.workFull = ko.observableArray([]); //完整视频  数组
	self.workShow = ko.observableArray([]); //演出作品  数组
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.Photo = ko.observable('../../images/my-default.png'); //头像
	self.DisplayName = ko.observable(""); //教师姓名
	self.SubjectName = ko.observable(""); //课程名字
	self.TeachAge = ko.observable(""); //教龄
	self.Province = ko.observable(""); //省份
	self.City = ko.observable(""); //市级
	self.District = ko.observable(""); //区级
	self.Score = ko.observable(""); //得分
	self.FavCount = ko.observable(""); //关注
	self.Star = ko.observable(0); //星级
	self.logoimgurl = ko.observable("../../images/videoLogo.png"); //视频上的播放logo
	self.photoimgurl = ko.observable("../../images/video-default.png"); //视频显示的图片
	self.title = ko.observable("成人钢琴教程 视频 钢琴 左手 分解 和炫"); //视频标题
	self.instructTeacher = ko.observable('设置授课老师');
	self.ProTitleAuth = ko.observable(''); //老师职称认证
	self.EduAuth = ko.observable(''); //老师学历认证
	self.IDAuth = ko.observable(''); //老师身份认证
	self.ProTitleText = ko.observable(''); //职称认证文本
	self.EduAuthText = ko.observable(''); //职称认证文本
	self.IDAuthText = ko.observable(''); //职称认证文本
	self.IsFamous = ko.observable(false);
	self.isFav = ko.observable(false);

	//分享的参数
	var shareTitle = "";
	var shareContent = "总能找到好老师";
	var shareUrl = common.gWebsiteUrl + "modules/teacher/teacherInfo.html?id=";
	var shareImg = "";

	var TUserID; //老师UserId，由上级页面传此参数
	var UserType; //getLocalItem('UserType');
	self.Courses = ko.observableArray([]); //课程数组
	self.CourseName = ko.observable("") //课程标题
	self.Introduce = ko.observable("") //个人简介
	self.Price = ko.observable("") //课程标题
		//var tUserId = 0; 	//此数据应当由上级页面传此参数
	var pageSize = 999; //视频显示数量3
	self.isIntructConfirm = ko.observable(0); //授课关系状态
	var UserId;
	var TeacherToStudentID; //授课关系id
	self.collectionStatus = ko.observable(""); //收藏

	self.getTeacherInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + TUserID + "&usertype=" + common.gDictUserType.teacher + '&StudentUserID=' + UserId, {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				self.DisplayName(result.DisplayName);
				self.Score(result.Score.toFixed(1));
				self.FavCount(result.FavCount);
				self.ProTitleAuth(result.ProTitleAuth);
				self.EduAuth(result.EduAuth);
				self.IDAuth(result.IDAuth);
				self.IsFamous(result.IsFamous);
				common.showCurrentWebview();
				common.gProfessionalType.forEach(function(item) {
					if (item.value == result.ProTitleType) {
						self.ProTitleText(item.text);
					}
				})
				self.Province(result.Province);
				self.City(result.City);
				self.District(result.District);
				self.Star(result.Star);
				self.isIntructConfirm(result.IsConfirm);
				if (self.isIntructConfirm() == common.gIsConfirm[2].value)
					self.instructTeacher('取消授课老师');
				if (common.StrIsNull(result.Photo) != '')
					self.Photo(common.getPhotoUrl(result.Photo));
				self.SubjectName(result.SubjectName);
				self.TeachAge(result.TeachAge);
				self.teacherInfo(result);
				self.Introduce(result.Introduce);
				shareTitle = "我在乐评家上分享了" + self.DisplayName() + "老师";
				shareImg = self.Photo();
				TeacherToStudentID = result.TeacherToStudentID;
			}
		});
	};
	self.openWork = function(type) {
		common.transfer('../works/worksListMyHeader.html', false, {
			workTypeID: 0, //type,
			ID: TUserID,
			workTitle: self.DisplayName() + '的所有作品'
		}, false, false);
	}

	//查看作品详情
	self.goWorksDetail = function(data) {
		common.transfer("../works/WorksDetails.html", false, {
			works: data
		}, false, false)
	}

	//获取分解视频
	self.getworkResolve = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[0].value + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				self.workResolve(result);
			}
		})
	}

	//获取完整教程
	self.getworkFull = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[1].value + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.workFull(result);
			}
		})
	};

	//获取演出作品
	self.getwork = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[2].value + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				self.workShow(result);
			}
		})
	}

	//老师课程
	self.getlesson = function() {
		mui.ajax(common.gServerUrl + "API/Course/GetCourseByUserID?userId=" + TUserID, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.Courses(result);
			}

		})
	}

	//帮我点评
	self.gotoComment = function() {
		common.transfer('../works/worksList.html', true, {
			teacher: self.teacherInfo(),
			displayCheck: true
		});
	}

	//交作业
	self.gotoHomeWork = function() {
		common.transfer('../works/worksList.html', true, {
			teacher: self.teacherInfo(),
			displayCheck: true,
			homeWork: true
		});
	}

	//预约上课
	self.appiontLesson = function() {
		common.transfer('../student/aboutLesson.html', true, {
			teacherName: self.DisplayName(),
			teacherPhoto: self.Photo(),
			userID: TUserID,
			courses: self.Courses()
		});
	}

	//关注
	self.Fav = function() {
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能关注~")
			return;
		}
		
		if (self.isFav()==true) {//取消关注
			var ret = common.deleteAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, TUserID, UserId);
			if (ret) {
				self.FavCount(self.FavCount() - 1);
				self.isFav(false);
				self.collectionStatus('');
				mui.toast('成功取消关注');
				var myWebview = plus.webview.getWebviewById('modules/my/my.html');
				mui.fire(myWebview, 'getAttention');
			}
		}else{
			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, TUserID);
			if (ret) {
				self.FavCount(self.FavCount() + 1);
				self.isFav(true);
				self.collectionStatus('teacheeInfo-sc-after');
				mui.toast('关注成功');
				var myWebview = plus.webview.getWebviewById('modules/my/my.html');
				mui.fire(myWebview, 'getAttention');
			}
		}

	}

	//浏览老师相册
	self.goTeacherAlbum = function() {
		common.transfer("../../modules/my/myAlbum.html", false, {
			userID: TUserID
		})
	}

	self.showTeacherImage = function() {
		var pv = new mui.previewImage();
		var ti = document.getElementById('teacherImage');
		pv.open(ti);
	}

	//设置为授课老师/取消申请中的老师
	self.setIntructTeacher = function() {
		if (UserId <= 0) {
			common.transfer('../account/login.html');
			return false;
		}
		if (self.isIntructConfirm() == common.gIsConfirm[0].value) {
			//设置授课老师
			var setInstructTeacherUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentAdd?TeacherID=" + self.teacherInfo().UserID + "&StudentID=" + getLocalItem('UserID') + "&SubjectID=" + self.teacherInfo().SubjectID + "&Type=" + common.gInstructType[0].value;
			//console.log(setInstructTeacherUrl);
			mui.confirm('是否设置' + self.DisplayName() + '老师为授课老师', '设置后不能更改', ['是', '否'], function(e) {
				if (e.index == 0) {
					mui.ajax(setInstructTeacherUrl, {
						type: 'POST',
						success: function(responseText) {
							//console.log(JSON.stringify(responseText));
							var result = JSON.parse(responseText);
							mui.toast('成功提交申请，请留意信息');
							self.isIntructConfirm(common.gIsConfirm[2].value);
							TeacherToStudentID = result.ID;
							self.instructTeacher('取消授课老师');
						}
					})
				}
			})
		} else if (self.isIntructConfirm() == common.gIsConfirm[2].value) {
			//取消申请的老师 
			var delInstructTeacherUrl = common.gServerUrl + "API/TeacherToStudent/StudentDelTeacher?TeacherToStudentID=" + TeacherToStudentID;
			//console.log(delInstructTeacherUrl);
			mui.confirm('是否取消' + self.DisplayName() + '老师为授课老师', '取消申请', ['是', '否'], function(e) {
				if (e.index == 0) {
					mui.ajax(delInstructTeacherUrl, {
						type: 'PUT',
						success: function(responseText) {
							mui.toast('成功取消');
							self.isIntructConfirm(common.gIsConfirm[0].value);
							self.instructTeacher('设置授课老师');
						}
					})
				}
			})
		}

	}

	//同学圈
	self.goClassmateCenter = function() {
		common.transfer('../works/classmateWorksHeader.html', true);
	}

	//分享老师
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl + TUserID, shareImg,common.gShareContentType.teacher);
			mui('#sharePopover').popover('toggle');
		};
	}

	//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}
	
	//跳转至咨询
	self.goUserNews = function() {
		common.transfer('../news/myNewsList.html', false, {
			userid: TUserID,
			userName:self.DisplayName()
		},false,false);
	}

	mui.init({
		beforeback: function() {
			var teacherList = plus.webview.currentWebview().opener();
			mui.fire(teacherList, 'refreshFav', {
				IsFavorite: self.isFav(),
				UserID: self.teacherInfo().UserID
			});
			return true;
		}
	});

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherID) !== "undefined") {
			TUserID = web.teacherID;
		}
		UserId = getLocalItem('UserID');
		if (common.StrIsNull(UserId) == '' || UserId <= 0) {
			UserId = 0;
		}

		//是否有授课列表页跳转
		if (typeof web.isInstruct != 'undefined') {

		}

		//是否已确认

		//获取动作的状态
		common.getActions(common.gDictActionType.Favorite, common.gDictActionTargetType.User, TUserID, function(result) {
			if (common.StrIsNull(result) != '') {
				var arr = JSON.parse(result);
				for (var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if (item.UserID.toString() != getLocalItem("UserID") ||
						item.TargetType.toString() != common.gDictActionTargetType.User ||
						item.TargetID.toString() != TUserID) {
						continue;
					}
					if (item.ActionType.toString() == common.gDictActionType.Favorite) {
						self.collectionStatus('teacheeInfo-sc-after');
						self.isFav(true);
					}
				}
			}
		});

		self.getTeacherInfo();
		self.getworkResolve();
		self.getworkFull();
		self.getwork();
		self.getlesson();
		Share.updateSerivces();
	});
}
ko.applyBindings(teacherInfo);