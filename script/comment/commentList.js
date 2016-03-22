var commentList = function() {
	var self = this;

	var workType = common.gTeacherCommentType[0].value; //默认显示作品点评
	var pageNum = 1;
	var sortID;
	var count = 0; //刷新检测次数
	self.comments = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.isTeacher = ko.observable(true);
	self.commentDes = ko.observable("还没有点评过作品呢~");
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentSort = ko.observable(8);
	self.workLen=ko.observable(0);
	
	
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

	mui.plusReady(function() {
		self.isTeacher(getLocalItem("UserType") == common.gDictUserType.teacher);

		var thisWeb=plus.webview.currentWebview();
		//var workTypeTmp = getLocalItem('comment.workType');
		if (typeof thisWeb.workType != "undefined" ) {
			workType = thisWeb.workType;
			if(workType==common.gTeacherCommentType[1].value){
				self.commentDes("还没有学生交过作业呢~");
			}
		}
		//console.log(workType);
		if (!self.isTeacher()) {
			self.commentDes('还没有点评呢，快让老师帮忙点评吧！');
		}

		self.getMyComments();

		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});

	//拼接请求Url
	self.getAjaxUrl = function() {
		//console.log(getLocalItem("UserID"));
		var ajaxUrl = common.gServerUrl + "API/Comment/GetTeacherComment?userId=" + getLocalItem("UserID");
		ajaxUrl += "&page=" + pageNum;

		if (typeof self.currentSubject().id === "number") {
			ajaxUrl += "&subject=" + self.currentSubject().id;
			ajaxUrl += "&subjectClass=" + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			ajaxUrl += "&sortType=" + sortID;
		}

		if (workType > 0) {
			ajaxUrl += "&workType=" + workType;
		}
		
		return ajaxUrl;
	}

	//加载点评
	self.getMyComments = function() {
		if (!common.hasLogined()) return;
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.comments(result);
				self.workLen(self.comments().length);
				mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
				common.showCurrentWebview();
				
			}
		})
	};

	//跳转至点评详情
	self.goCommentDetail = function(data) {
		common.transfer('commentDetails.html', true, {
			teacherComment: data
		}, false, false)
	}

	//重置上拉
	function refreshPull() {
		mui('#pullrefresh').pullRefresh().refresh(true);
		//mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

	}

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			pageNum = 1; //重新加载第1页
			self.getMyComments();
		}, 1500);
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					if (result && result.length > 0) {
						self.comments(self.comments().concat(result));
						self.workLen(self.comments().length);
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
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//日期转化为数字
	function dateNum(item) {
		var arr = [];
		arr = item.split("-");
		var str = arr.join("");
		return Number(str);
	}

	//跳转到点评界面
	self.gotoAddComment = function() {
		common.transfer('../works/worksList.html', true, {
			displayCheck: true
		});
	}

	//跳转到登录
	self.goLogin = function() {
		common.transfer('../../modules/account/login.html', true);
	};

	window.addEventListener("refreshComments", function(event) {
		if (event.detail.comment) {
			var retComment = event.detail.comment;
			var arrTmp = [];
			self.comments().forEach(function(item) {
				if (item.ID == retComment.ID) {
					item.CommentToRules = retComment.CommentToRules;
					item.IsFinish = retComment.IsFinish;
					item.TotalComment = retComment.TotalComment;
				}
				arrTmp.push(item);
			});

			self.comments.removeAll();
			self.comments(arrTmp);
		}
	});
}
ko.applyBindings(commentList);