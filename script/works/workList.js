var workList = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var sortID;
	self.teacherInfo = ko.observable(); //点评老师对象
	self.worksList = ko.observableArray([]);
	self.displayCheck = ko.observable(false); //控制单选框和确认按钮是否显示
	self.UnreadCount = ko.observable("0");
	self.dbSubject = ko.observable("科目");
	self.dbSort = ko.observable("排序");
	self.isChangeTeacher=ko.observable(true);
	//var receiverId = getLocalItem("UserID");
	var web;

	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);

	self.currentSubject = ko.observable({}); //当前选中的科目
	self.isHomeWork = ko.observable(false);
	
	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Work/GetMyFinishedWorks?userID=" + getLocalItem("UserID");
		ajaxUrl += "&page=" + pageNum;

		if (typeof self.currentSubject().id === "function") {
			ajaxUrl += "&subject=" + self.currentSubject().id();
			ajaxUrl += "&subjectClass=" + self.currentSubject().subjectClass();
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			ajaxUrl += "&sortType=" + sortID;
		}
		//mui.toast(ajaxUrl);
		return ajaxUrl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				result.forEach(function(item){
					var obj = {
						info: item,
						selected: ko.observable(false)
					};
					self.worksList.push(obj);
				})
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

	/*document.querySelector('#dbSubject').addEventListener('tap', function() {
		mui('#popSubjects').popover('toggle');
	});
	document.querySelector('#dbSort').addEventListener('tap', function() {
		mui('#middlePopover2').popover('toggle');
	});*/

	function pulldownRefresh() {
		setTimeout(function() {
			pageNum = 1;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
					self.worksList([]);
					result.forEach(function(item){
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.worksList.push(obj);
					})
					mui('#pullrefresh').pullRefresh().refresh(true);	//重置上拉加载
				}
			});
		}, 1500)
	}

	//刷新
	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					
					if (result && result.length > 0) {
						result.forEach(function(item){
							var obj = {
								info: item,
								selected: ko.observable(false)
							};
							self.worksList.push(obj);
						})
						if(result.length < common.gListPageSize){
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						}
						else{
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);	//false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);	//true代表没有数据了
					}
				}
			});
		}, 1500)
	};

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//选择科目
	self.selectSubject = function(data) {
		self.currentSubject(data);
		self.worksList.removeAll(); //先移除所有

		/*此处可能有bug，若之前所选科目已经刷新到无数据了，
		    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
		pageNum = 1; //还原为显示第一页
		self.getWorks();
		mui('#popSubjects').popover('toggle');
	}

	self.clickOne = function(data) {
		if(self.displayCheck()){
			if(data.selected()) return;		//已勾选
			
			data.selected(true);
			self.worksList().forEach(function(item){
				if(item.info.ID != data.info.ID)
					item.selected(false);
			})
		}
	};

	self.gotoSubmitClass = function() {
		var sel=false;
		for(var i = 0; i < self.worksList().length; i++){
			var item = self.worksList()[i];
			if(item.selected()){
				//if(web.opener().id)
				var info = self.teacherInfo();
				if(web.opener().id=='modules/home/select.html' || typeof(info) !== "undefined" ){
					common.transfer('../student/submitComment.html', true, {
						works: item.info,
						teacher: teacherInfo(),
						homeWork: self.isHomeWork(),
						isChangeTeacher:self.isChangeTeacher()
					},false,true,'submitCommentId');
				}else{
					common.transfer('../teacher/teacherListHeader.html', true, {
						works: item.info,
						displayCheck: true
					});
				}
				
				/*if (typeof(info) === "undefined") {
					common.transfer('../teacher/teacherListHeader.html', true, {
						works: item.info,
						displayCheck: true
					});
				} else {
					common.transfer('../student/submitComment.html', true, {
						works: item.info,
						teacher: teacherInfo(),
						homeWork: self.isHomeWork(),
						isChangeTeacher:self.isChangeTeacher()
					});
				}
				*/
				sel = true;
				break;
			}
		}
	
		if(!sel){
			mui.toast("请选择作品");
		}
	}

	mui.plusReady(function() {
		web = plus.webview.currentWebview();
		if (typeof(web.displayCheck) !== "undefined") {
			self.displayCheck(web.displayCheck);
		}
		if (typeof(web.teacher) !== "undefined") {
			self.teacherInfo(web.teacher);
		}
		if (typeof(web.homeWork) !== "undefined") {
			self.isHomeWork(web.homeWork);
		}
		if(typeof web.isChangeTeacher !=='undefined'){
			self.isChangeTeacher(web.isChangeTeacher);
		}
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if(self.tmplSubjects().length > 0){
			self.currentSubject(self.tmplSubjects()[0]);
		}
		
		self.getWorks();
	});
}

ko.applyBindings(workList);