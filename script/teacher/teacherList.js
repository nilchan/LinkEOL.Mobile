var viewModel = function() {
	var self = this;
	var pageID = 1;
	var thisUrl = common.gServerUrl + "API/Teacher"; //接口url
	var pageUrl = "&page=";
	var subjectUrl = "&subject=";
	var subjectClassUrl = "&subjectClass=";
	var starUrl = "&star=";
	var sortUrl = "&sortType=";
	var isFamous = "?isFamous=";
	var seacheUrl = '&displayname=';
	self.seachDisplayname = ko.observable(''); //搜索关键字
	self.isFamousTeacher = ko.observable(true); //是否为名师，true为是，false为专业老师
	var refreshFlag = true;
	var currentClasses = -1;
	self.isHomeWork = ko.observable(false);
	//接收属性
	var works;

	self.teacherList = ko.observableArray([]);
	self.dbStar = ko.observable("星级");
	self.dbSort = ko.observable("排序");
	self.SubjectID = ko.observable(0); //上一个页面传递过来的科目ID

	self.displayCheck = ko.observable(false); //是否显示选择

	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubjectClasses = ko.observable(0);
	self.currentSubject = ko.observable(0); //当前选中的科目

	self.stars = ko.observableArray([]);
	self.currentStar = ko.observable(-1); //所有星级

	self.sorts = ko.observableArray([]);
	self.currentSort = ko.observable(1);

	self.subjectSelect = ko.observableArray([]);


	self.clampText = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	//获取老师列表
	self.getTeacherList = function() {
		var resultUrl = self.getAjaxUrl();
		//console.log(resultUrl);
		mui.ajax(resultUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.teacherList([]);
				result.forEach(function(item) {

					var obj = {
						info: item,
						selected: ko.observable(false)
					};
					if (self.isHomeWork()) {
						if (item.IsConfirm == true) {
							self.teacherList.push(obj);
						}
					} else {
						self.teacherList.push(obj);
					}
				})
				self.clampText();
				mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100);
				plus.nativeUI.closeWaiting();
				if (self.isHomeWork() && self.teacherList().length == 0) {
					mui.toast('你还没有添加授课老师！');
					mui.back();
				}
				//common.showCurrentWebview();
				//self.teacherList(result);
			}
		});
	};

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			//pageID++;
			pageID = 1;

			var resultUrl = self.getAjaxUrl();

			mui.ajax(resultUrl, {
				type: 'GET',
				success: function(responseText) {
					if (responseText === "") {
						refreshFlag = false;
					}
					var result = eval("(" + responseText + ")");
					self.teacherList([]);
					result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						if (self.isHomeWork()) {
							if (item.IsConfirm == true) {
								self.teacherList.push(obj);
							}
						} else {
							self.teacherList.push(obj);
						}
					})
					self.clampText();
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();

					if (result && result.length > 0) {
						if (result.length >= common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
						}
					}
				}
			});
		}, 1500);
	}

	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			//mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageID++;
			var resultUrl = self.getAjaxUrl();
			mui.ajax(resultUrl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");

					if (result && result.length > 0) {
						result.forEach(function(item) {
							var obj = {
								info: item,
								selected: ko.observable(false)
							};
							if (self.isHomeWork()) {
								if (item.IsConfirm == true) {
									self.teacherList.push(obj);
								}
							} else {
								self.teacherList.push(obj);
							}
						})
						self.clampText();
						if (result.length < common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
					}
				}
			});
		}, 1500);
	};

	//重置上拉
	function refreshPull() {
		mui('#pullrefresh').pullRefresh().refresh(true);
		//mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
				mui('#down-nav2').scroll();
				mui('#down-nav3').scroll();
			}
		});
	}

	//选择科目
	self.selectSubject = function(data) {
		self.currentSubject(data);
		self.teacherList.removeAll(); //先移除所有

		/*此处可能有bug，若之前所选科目已经刷新到无数据了，
		    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
		pageID = 1; //还原为显示第一页
		self.getTeacherList();
		mui('#pull-down-nav').popover('toggle');
		refreshPull();
	}

	//选择星级
	self.selectStar = function(ss) {
		self.currentStar(ss.value);
		self.teacherList.removeAll(); //先移除所有
		pageID = 1; //还原为显示第一页
		self.getTeacherList();
		mui('#pull-down-nav').popover('toggle');
		refreshPull();
	}

	//选择排序
	self.selectSort = function(ss) {
		self.currentSort(ss.value);
		self.teacherList.removeAll(); //先移除所有
		pageID = 1; //还原为显示第一页
		self.getTeacherList();
		mui('#pull-down-nav').popover('toggle');
		refreshPull();
	}

	self.clickOne = function(data) {
		if (self.displayCheck()) {
			if (data.selected()) return; //已勾选

			data.selected(true);
			self.teacherList().forEach(function(item) {
				if (self.isHomeWork() && item.info.UserID != data.info.TeacherUserID) {
					item.selected(false);
				} else if (item.info.ID != data.info.ID) {
					item.selected(false);
				}
			})
		} else {
			var tmpID = data.info.UserID;
			common.transfer('../../modules/teacher/teacherInfo.html', false, {
				teacherID: tmpID
			}, false, false);
		}
	};

	self.gotoSubmitClass = function() {
		var sel = false;
		for (var i = 0; i < self.teacherList().length; i++) {
			var item = self.teacherList()[i];
			if (item.selected()) {
				common.transfer('../student/submitComment.html', true, {
					works: self.works,
					teacher: item.info,
					homeWork: self.isHomeWork()
				});
				sel = true;
				break;
			}
		}

		if (!sel) {
			mui.toast("请选择一位老师");
		}
	};

	//获取老师请求的url
	self.getAjaxUrl = function() {

		var curl = isFamous + self.isFamousTeacher() + pageUrl + pageID;
		if (typeof self.currentSubject().id === "number") {
			curl += subjectUrl + self.currentSubject().id;
			curl += subjectClassUrl + self.currentSubject().subjectClass;
		}
		if (typeof(self.currentStar()) === "number" && self.currentStar() > 0) {
			curl += starUrl + self.currentStar();
		}
		if (typeof(self.currentSort()) === "number" && self.currentSort() > 0) {
			curl += sortUrl + self.currentSort();
		}
		if (common.StrIsNull(self.seachDisplayname()) != '') {
			curl += seacheUrl + self.seachDisplayname();
		}
		//console.log(thisUrl+curl);
		if (self.displayCheck()) {
			if (self.isHomeWork()) {
				return common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?StudentID=" + getLocalItem('UserID') + "&page=" + pageID;
			} else {
				return common.gServerUrl + "API/Teacher/GetFamousTeacherList?UserID=" + getLocalItem('UserID') + "&page=" + pageID;


			}
		}

		return thisUrl + curl;


	}

	//重写返回方法
	old_back = mui.back;
	mui.back = function() {
		old_back();
		plus.webview.currentWebview().reload(true);

	}

	//名师
	window.addEventListener("changeItem1", function(event) {
		//mui.toast('1111');
		self.isFamousTeacher(true);
		pageID = 1;
		self.getTeacherList();
		refreshPull();
	});

	//专业老师
	window.addEventListener("changeItem2", function(event) {
		//mui.toast('2222');
		self.isFamousTeacher(false);
		pageID = 1;
		self.getTeacherList();
		refreshPull();
	});

	//搜索事件
	window.addEventListener('seachEvent', function(event) {
		self.seachDisplayname(event.detail.seachValue);
		pageID = 1;
		self.getTeacherList();
		refreshPull();

	})

	//刷新关注
	window.addEventListener('refreshFav', function(event) {
		if (event.detail.IsFavorite != '') {
			/*var arrTmp = [];
			self.teacherList().forEach(function(item) {
				if (item.info.UserID == event.detail.UserID) {
					item.info.UserID=event.detail.IsFavorite;
				}
				arrTmp.push(item);
			})
			self.teacherList.removeAll();
			self.teacherList(arrTmp);*/
			pageID = 1;
			self.getTeacherList();
			refreshPull();
		}

	})

	self.setClasses = function(class1) {
		currentClasses = class1.subjectClass;
		var tmp = self.tmplSubjects();
		var newS = [];
		self.currentSubjectClasses(class1);
		self.currentSubject(-1);
		//alert('class1.id:' + class1.subjectClass + '~cu:' + self.currentSubject().subjectClass);
		tmp.forEach(function(item) {
			if (item.subjectClass == currentClasses) {
				newS.push(item);
			}
		});
		self.subjectSelect(newS);
	};

	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值

		if (typeof(web.displayCheck) !== "undefined") {
			self.displayCheck(web.displayCheck);
			self.works = web.works;
			//			$A.gI('teacher-scroll').style.marginTop = '45px';
		}

		if (typeof(web.homeWork) !== "undefined") {
			self.isHomeWork(web.homeWork);
		}

		//科目
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		self.currentSubjectClasses(self.tmplSubjectClasses()[0]);
		if (typeof(web.data) !== "undefined") {
			self.currentSubject(web.data);
		} else {
			if (self.tmplSubjects().length > 0) {
				self.currentSubject(self.tmplSubjects()[0]);
			}
		}

		//星级、排序
		self.stars(common.gJsonTeacherLever);
		self.sorts(common.gJsonTeacherSort);
		self.getTeacherList();
	});

	$(function() {
		$('#subject-nav').click(function(event) {
			$('#sort-nav-list').hide();
			$('#subject-nav-list').show();
			$(this).addClass('select-current-1');
			$('#sort-nav').removeClass('select-current-1');
			if (currentClasses != -1) {
				$('#down-nav3').show();
			}
		});
		$('#sort-nav').click(function(event) {
			$('#subject-nav-list').hide();
			$('#sort-nav-list').show();
			$('#down-nav3').hide();
			$(this).addClass('select-current-1');
			$('#subject-nav').removeClass('select-current-1');
		});
		$('#subject-nav-list').click(function(event) {
			$('#down-nav3').hide();
			$('#down-nav3').show();
		});
	});
};

ko.applyBindings(viewModel);