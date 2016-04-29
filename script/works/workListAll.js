var workListAll = function() {
	var self = this;
	var actID = 0;
	var pageNum = 1;
	var receiverId = 1;
	var pageUrl = "?page=";
	var subjectUrl = "&subject=";
	var subjectClassUrl = "&subjectClass=";
	var sortUrl = "&sortType=";
	var sortID;
	var workTypeUrl = "&workType=";
	var workTypeID;
	var page = 1;
	var userType = "&userType=";
	var seachValue;
	var count = 0; //上拉刷新检测次数
	self.sortList = ko.observableArray([]);
	self.workType = ko.observable([]);
	self.workUserType=ko.observable('');//当前作品的用户大类  (学生 or 老师)
	common.gJsonWorkTypeTeacher.unshift({
		value: 0,
		text: "全部"
	});
	//var contentnomore = "上拉显示更多"
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentSubjectClasses = ko.observable(-1);
	self.currentSubject = ko.observable(-1); //当前选中的科目
	self.currentWorkTypes = ko.observable(0);
	self.currentSort = ko.observable(5);
	self.IsFamous = ko.observable(-1); //是否为名师，0 为专业老师，1为名师    默认全部老师
	self.subjectSelect = ko.observableArray([]);
	var currentClasses = -1;
	self.worksLength=ko.observable(0);

	//初始化界面
	mui.init({
		pullRefresh: {
			container: '#pullrefreshAll',
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

	self.getAjaxUrl = function() {
		var curl = pageUrl + page;
		if (typeof self.currentSubject().id === "number") {
			curl += subjectUrl + self.currentSubject().id;
			curl += subjectClassUrl + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		if (common.StrIsNull(self.workUserType()) != '') {
			curl += userType + self.workUserType();
		}
		if (common.StrIsNull(seachValue) != '') {
			curl += '&title=' + seachValue;
		}
		if (typeof self.IsFamous() != 'undefined') {
			curl += '&isFamous=' + self.IsFamous();
		}

		var baseUrl = common.gServerUrl + "API/Work";
		if (actID <= 0) {
			if (typeof(workTypeID) === "number" && workTypeID > 0) {
				curl += workTypeUrl + workTypeID;
			}
		} else {
			baseUrl = common.gServerUrl + "Common/Work/GetActivityWorks";
			curl += '&actID=' + actID;
		}
		return baseUrl + curl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
				self.worksLength(self.works().length);
				common.showCurrentWebview();
				//plus.nativeUI.closeWaiting();
			}
		});
	}

	//下拉加载
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPulldownToRefresh(); //refresh completed
			page = 1;

			if (plus.networkinfo.getCurrentType() > 1) {
				//contentnomore = "上拉显示更多";
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						self.works.removeAll(); //先移除所有,防止视频已删除还保留
						var result = eval("(" + responseText + ")");
						self.works(result);
						self.worksLength(self.works().length);
						mui('#pullrefreshAll').pullRefresh().refresh(true); //重置上拉加载
					}
				});
			}
		}, 1500);

	}

	//上拉刷新pullupRefresh
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			//this.endPullUpToRefresh((++count > 2));
			page++;

			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result.length > 0) {
							self.works(self.works().concat(result));
							self.worksLength(self.works().length);
							if (result.length < common.gListPageSize) {
								mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(false);
							}
						} else {
							mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(true);
						}
					}
				});
			};
		}, 1500);
	};
	
		//事件
	var cacelStopped = function() {
		var _popover = document.querySelector('.mui-popover.mui-active');
		if( _popover ) {
			return ;
		} else {
			mui('#pullrefreshAll').pullRefresh().setStopped(false);
			this.removeEventListener('webkitTransitionEnd', cacelStopped);
		}
	}
	
	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
				mui('#down-nav2').scroll();
				mui('#down-nav3').scroll();
		});
	}

	//选择科目
	self.selectSubject = function(data) {
		self.currentSubject(data);
		self.works.removeAll(); //先移除所有
		page = 1; //还原为显示第一页
		count = 0;
		mui('#pullrefreshAll').pullRefresh().refresh(true);
		self.getWorks();
		mui('#pull-down-nav').popover('toggle');
	}

	//选择类别
	self.selectWorksType = function() {
		self.currentWorkTypes(this.value);
		self.works.removeAll();
		workTypeID = this.value;
		page = 1; //还原为显示第一页
		count = 0; //还原刷新次数
		mui('#pullrefreshAll').pullRefresh().refresh(true);
		self.getWorks();
		mui('#pull-down-nav').popover('toggle');

	}

	//作品排序
	self.sortWorks = function() {
		self.currentSort(this.value);
		self.works.removeAll();
		sortID = this.value;
		page = 1; //还原为显示第一页
		count = 0; //还原刷新次数
		mui('#pullrefreshAll').pullRefresh().refresh(true);
		self.getWorks();
		//console.log(sortID);
		mui('#pull-down-nav').popover('toggle');
	}

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

	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("WorksDetails.html", false, {
			works: data
		}, false, false)
	}

	/*	self.IsAuthor = ko.computed(function() {
				if (self.UserID == this.AuthorID())
					return true;
				else
					return false;
			})*/

	//赞
	self.Like = function() {
		var tmp = common.clone(this);
		//mui.toast(this.LikeCount);
		if (this.AuthorID == self.UserID) {
			mui.toast("作者本人不允许赞");
			return
		} else {
			var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, this.ID);
			if (ret) {
				tmp.LikeCount = tmp.LikeCount + 1;
				self.works.replace(this, tmp);
				mui.toast('感谢您的赞许');
			}
		}
	}
	
	

	mui.plusReady(function() {
		//活动作品
		var thisWeb = plus.webview.currentWebview();
		actID = getLocalItem('tmp.activityWorkID');
		removeLocalItem('tmp.activityWorkID'); //及时清除，否则在所有作品那里会有问题
		if (typeof thisWeb.workUserType != "undefined") {
			self.workUserType(thisWeb.workUserType);
  			if (self.workUserType() == common.gDictUserType.teacher) {
				self.workType(common.gJsonWorkTypeTeacher);
			} else {
				self.workType(0);
			}
		}
		if (typeof thisWeb.IsFamous != 'undefined') {
			self.IsFamous(thisWeb.IsFamous);
		}


		self.getWorks();
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});

	window.addEventListener('refreshwoks', function(event) {//刷新作品赞
		self.works().forEach(function(item) {
			var tmp = common.clone(item);
			if (item.ID == event.detail.worksId) {
				tmp.LikeCount = event.detail.LikeCount;
				self.works.replace(item, tmp);
			}
		});
	});
	window.addEventListener('refreshAllworks',function(event) {//作品删除
		if (event.detail.worksStatus) {
			self.works().forEach(function(item) {
				if (item.ID == event.detail.worksId) {
					self.works.remove(item);
				}
			});
		}
	});
	
	window.addEventListener('seachworks', function(event) {//作品搜索
		seachValue = event.detail.seachValue;
		page = 1; //还原为显示第一页
		count = 0; //还原刷新次数
		mui('#pullrefreshAll').pullRefresh().refresh(true);
		self.getWorks();
	});
	
	window.addEventListener('reloadWorks', function(event) {//作品搜索
		page = 1; //还原为显示第一页
		count = 0; //还原刷新次数
		mui('#pullrefreshAll').pullRefresh().refresh(true);
		self.getWorks();
	});


	$(function() {
		$('#sort-nav-list').hide();
			$('#type-nav-list').hide();
			$('#subject-nav-list').hide();
		$('#subject-nav').click(function(event) {
			$('#sort-nav-list').hide();
			$('#type-nav-list').hide();
			$('#subject-nav-list').show();
			$(this).addClass('select-current-1');
			$('#sort-nav').removeClass('select-current-1');
			$('#type-nav').removeClass('select-current-1');
			if (currentClasses != -1) {
				$('#down-nav3').show();
			}
		});
		$('#sort-nav').click(function(event) {
			$('#subject-nav-list').hide();
			$('#type-nav-list').hide();
			$('#sort-nav-list').show();
			$('#down-nav3').hide();
			$(this).addClass('select-current-1');
			$('#subject-nav').removeClass('select-current-1');
			$('#type-nav').removeClass('select-current-1');
		});
		$('#type-nav').click(function(event) {
			$('#subject-nav-list').hide();
			$('#sort-nav-list').hide();
			$('#type-nav-list').show();
			$('#down-nav3').hide();
			$(this).addClass('select-current-1');
			$('#sort-nav').removeClass('select-current-1');
			$('#subject-nav').removeClass('select-current-1');
		});
		$('#subject-nav-list').click(function(event) {
			document.getElementById('pull-down-nav').addEventListener('webkitTransitionEnd', cacelStopped);
			mui('#pullrefreshAll').pullRefresh().setStopped(true);
			$('#down-nav3').hide();
			$('#down-nav3').show();
		});
	});
}
ko.applyBindings(workListAll);