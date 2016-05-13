var viewModel = function() {
	var self = this;
	self.instructedArray = ko.observableArray([]); //授课关系列表
	self.isGetStudent = ko.observable(''); //老师是否查看授课学生，是为查看学生，否为查看老师
	var userId = getLocalItem('UserID');
	var pageID=1;


	self.clampText = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	//获取授课老师列表
	self.geIntructList = function() {
		var thisUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?StudentID=" + userId+'&page='+pageID;
		mui.ajax(thisUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.instructedArray(result);
				self.clampText();
				common.showCurrentWebview();
			}
		})
	};
	
	var shareUrl = common.gWebsiteUrl; //分享附上的链接，为公司主页
	var shareTitle = "我就知道你喜欢学音乐" //分享内容的标题
	var shareContent = "学音乐的那点事"; //分享的内容*/
	var shareImg = "";
	
	//分享老师
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg,common.gShareContentType.recommend);
			mui('#sharePopover').popover('toggle');
		};
	}
	
	//关闭分享弹窗
	self.closeShare=function(){
		mui('#sharePopover').popover('toggle');
	}


	//跳转至老师详情
	self.goTeacherInfo = function(data) {
		//console.log(JSON.stringify(data));
		common.transfer('../teacher/teacherInfo.html', true, {
			teacherID: data.TeacherUserID,
			isInstruct: true, //是否由授课列表页跳转
			isConfirm: data.IsConfirm //是否已确认
		}, false, false)
	}

	//新增授课老师
	self.addIntructTeacher = function() {
		common.transfer('../teacher/teacherListHeader.html', true, {}, false, false);
	}
	
	//关闭分享
	self.closeShare=function(){
		//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			/*down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},*/
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		},
		beforeback: function() {
			var opener = plus.webview.currentWebview().opener();
			
			common.refreshHomeworkGuide(opener);
			
			return true;
		}
	});

	/*//下拉刷新
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
					self.geIntructList([]);
					result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.geIntructList.push(obj);
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
	}*/

	function pullupRefresh() {
		setTimeout(function() {
			//mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageID++;
			var thisUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?StudentID=" + userId+'&page='+pageID;

			mui.ajax(thisUrl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					if (result && result.length > 0) {
						self.instructedArray(self.instructedArray().concat(result));
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
			}
		});
	}
	
	self.qrcodeEvent = function() { //扫一扫
		if (userId > 0) {
			//qrcodeEvent.show();
			//common.transfer("qrcode.html", false, {}, false, true);
			common.transfer("qrcodeEvent.html", false, {}, false, false);
		} else {
			mui.toast("亲~登录后才能扫一扫哦")
		}
	}
	
	self.gotoTeacherList=function(){
		common.transfer('../teacher/teacherListHeader.html');
	}


	//mui('#popSort').popover('toggle');
	mui.plusReady(function() {
		var thisWeb = plus.webview.currentWebview();
		if (typeof thisWeb.isGetStudent != 'undefined') {
			self.isGetStudent(thisWeb.isGetStudent);
		}
		
		self.geIntructList();
		Share.updateSerivces();
	});
};

ko.applyBindings(viewModel);