var mydownload = function() {
	var self = this;
	var arrDownloaderTask = [];
	self.downloadList = ko.observableArray([]);
	self.viewDetail = ko.observable(false);
	self.workContentText = ko.observable('');

	mui.init({
		pullRefresh: {
			container: '#pullrefreshdown',
			down: {
				callback: pulldownRefresh
			}
		}
	});

	/**
	 * 刷新下载进度
	 * @param {Object} task 上传任务。{workId: 作品ID, downloadTask: {isFinish: false, aPercent: 80, vid: '123'}}
	 * @param {String} description 描述（成功则为空字符串）
	 */
	var refreshDownloadState = function(task, description) {
		for (var i = 0; i < self.downloadList().length; i++) {
			var item = self.downloadList()[i];
			//alert('task: '+JSON.stringify(task));
			//alert('item: '+JSON.stringify(item));
			if (item.isFinish()) continue; //已上传完成的无需刷新

			if (task.workId == item.works.workId) {
				if (task.downloadTask.isFinish && common.StrIsNull(description) == '') {
					item.percentage(100);
					item.isFinish(true);
					
					var tmp = plus.storage.getItem(common.gVarLocalDownloadTask);
					var tasks = JSON.parse(tmp);
					for (var j = 0; j < tasks.length; j++) {
						if (tasks[j].workId == item.works.workId) {
							tasks[j].isFinish = true; //设置为已完成
							break;
						}
					}
					//alert('refreshDownloadState: '+ JSON.stringify(tasks));
					plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(tasks));
					//alert('after set: '+ plus.storage.getItem(common.gVarLocalDownloadTask));

					continue;
				}
				
				item.percentage(task.downloadTask.aPercent);
			}
		}
	}
	
	//删除下载
	self.deleteTask = function(data){
		//alert(JSON.stringify(data));
		var btnArray = ['是', '否'];
		mui.confirm('确认删除本下载吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.toast('成功删除了本次下载');
				download.deleteTask(data.works.workId);

				self.downloadList.remove(data);
			}
		});
	}

	//点击任务
	self.clickTask = function(data) {
		if (data.isFinish() == false){	//未完成下载
			self.deleteTask(data);
		}
		else{	//已完成下载，可跳转浏览
			plus.nativeUI.showWaiting();
			//触发Header页面的事件
			var workParent = plus.webview.currentWebview().opener();
			if (workParent != null) {
				mui.fire(workParent, 'changeHeaderViewState', {
					workTitle: data.workTitle()
				});
			}
			
			var top = 44 * 2;
			//plus.runtime.wi
			var width = document.body.clientWidth;
			var height = width * 9 / 16;
			
			self.viewDetail(true);
			document.getElementById('videoCtrl').style.top = top+'px';
			document.getElementById('videoCtrl').style.height = height+'px';
			self.workContentText(data.workContentText());
			
			//alert(document.getElementById('videoCtrl').style.height);
			//设置视频位置
			var ret = plus.VideoUtility.InitPlayer(data.workVidPolyv(), common.gJsonVideoLevel.SD, [
				0, top, width, height
			],"");
			
			/*if (ret && ret.status) {
				var ret = plus.VideoUtility.PlayVideo(data.workVidPolyv(), common.gJsonVideoLevel.SD);
				if (ret && !ret.status) {
					mui.toast('视频加载失败');
				}
			}*/
			
			plus.nativeUI.closeWaiting();
		}
	}
	
	//取消查看下载作品详情
	window.addEventListener('changeContentViewState',function(event) {
		if(self.viewDetail() == true)
			plus.VideoUtility.ClosePlayer();
		
		self.viewDetail(false);
	});
	
	//跳转至所有作品
	self.gotoAllWorks = function() {
		common.transfer("worksListAllHeader.html", false, {
			WorkUserType: common.gDictUserType.teacher
		}, false, false);
	};

	/**
	 * 根据作品实例对象返回用于显示的视图模型
	 * @param {Object} worksObj 作品实例
	 */
	var worksItem = function(worksObj) {
		var self = this;
		self.works = worksObj;
		self.workId = ko.observable(worksObj.workId); //作品编码
		self.workAuthorName = ko.observable(worksObj.workAuthorName); //作品作者名称
		self.workTitle = ko.observable(worksObj.workTitle); //作品标题
		self.workSubjectName = ko.observable(worksObj.workSubjectName); //科目名称
		self.workContentText = ko.observable(worksObj.workContentText);
		self.videoThumbnail = ko.observable('');
		if (common.StrIsNull(worksObj.workimgUrl) == '') {
			self.videoThumbnail('../../images/video-big-default.png');
		} else {
			self.videoThumbnail(worksObj.workimgUrl); //缩略图
		}
		self.workVidPolyv = ko.observable(worksObj.workVidPolyv); //视频标识
		self.videopath = ko.observable(worksObj.videopath); //视频路径
		self.localpath = ko.observable(worksObj.localpath); //本地路径
		self.isFinish = ko.observable(worksObj.isFinish); //专门用ko变量记录，便于更新*/
		self.percentage = ko.observable(0);
		if(self.isFinish()){
			self.percentage(100);
		}
		self.taskStatusText = ko.computed(function() { //任务状态文字
			if (self.isFinish()) {
				return '下载完成';
			} else {
				return '下载中';
			}
		});
	}

	//获取下载列表
	self.getDownloadWorks = function() {
		//alert('getDownloadWorks');
		var oldTasks = plus.storage.getItem(common.gVarLocalDownloadTask);
		
		//alert(oldTasks);
		var result = eval("(" + oldTasks + ")");
		if (result && result.length > 0) {
			result.forEach(function(item) {
				var exists = false;
				for (var j = self.downloadList().length - 1; j >= 0; j--) {
					var item2 = self.downloadList()[j];
					if(item.workId == item2.works.workId){
						exists = true;
						break;
					}
				}
				
				if(exists == false){
					var obj = new worksItem(item);
					self.downloadList.unshift(obj);
				}
			})

			download.initTasks(refreshDownloadState);

			common.showCurrentWebview();
		} else {
			common.showCurrentWebview();
		}
	};

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshdown').pullRefresh().endPulldownToRefresh(); //refresh completed
			//self.getWorks();
			refreshHandleState();
		}, 1500);
	}
	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//开始下载
	window.addEventListener('triggerDownload',function(){
		self.getDownloadWorks();
	});

	mui.plusReady(function() {
		//self.getDownloadWorks();
	});
}
ko.applyBindings(mydownload);