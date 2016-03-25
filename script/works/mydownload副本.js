var mydownload = function() {
	var self = this;
	var pullupValue = 1;
	var arrDownloaderTask = [];
	self.downloadList = ko.observableArray([]);

	mui.init({
		pullRefresh: {
			container: '#pullrefreshdown',
			down: {
				callback: pulldownRefresh
			}
		}
	});

	/*
	 * 下载显示页，已下载作品+下载任务
	 * 
	 */
	var refreshdownloadState = function(task, finished) {
		for (var i = 0; i < self.downloadList().length; i++) {
			var item = self.downloadList()[i];
			/*console.log('task:'+JSON.stringify(task));
			console.log('item:'+JSON.stringify(item));*/
			if (task.url == item.videopath()) {
				if (finished) {
					item.downloadedSize(item.totalSize());
					/*item.localpath(task.filename);
					item.IsFinish(true);
					VideoJS.setupAllWhenReady();*/
					var tmp = plus.storage.getItem(common.gVarLocalDownloadTask);
					var tasks = JSON.parse(tmp);
					for (var j = 0; j < tasks.length; j++) {
						if (tasks[j].workId == item.works.workId) {
							/*var tmp = task.filename.split('.');
							var lastPart = tmp[tmp.length - 1];
							var newname = '';
							for(var k = 0; k < tmp.length - 1; k++){
								newname += tmp[k];
							}
							newname += item.works.workId + '.' + lastPart;*/
							var newname = task.filename;
							tasks[j].localpath = newname; //设置本地路径
							tasks[j].IsFinish = true; //设置为已完成
							break;
						}
					}
					plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(tasks));
					mui.toast('下载完成');
					self.getWorks();
					return;
				}

				if (item.totalSize() <= 0 && task.totalSize > 0) {
					item.totalSize(task.totalSize);
				}
				item.downloadedSize(task.downloadedSize);
				return;
			}
		}
	}

	/**
	 * 根据作品实例对象返回用于显示的视图模型
	 * @param {Object} worksObj 作品实例
	 */
	var worksItem = function(worksObj) {
		var self = this;
		self.works = worksObj;
		self.WorkID = ko.observable(worksObj.ID); //作品编码
		self.workAuthorName = ko.observable(worksObj.workAuthorName); //作品作者名称
		self.workTitle = ko.observable(worksObj.workTitle); //作品标题
		self.workimgUrl = ko.observable(worksObj.workimgUrl); //缩略图
		self.workSubjectName = ko.observable(worksObj.workSubjectName); //科目名称
		self.workContentText = ko.observable(worksObj.workContentText);
		self.videopath = ko.observable(worksObj.videopath); //视频路径
		self.localpath = ko.observable(worksObj.localpath); //本地路径
		self.IsFinish = ko.observable(worksObj.IsFinish); //专门用ko变量记录，便于更新*/
		self.IsChecked = ko.observable(false); //标记是否选中
		self.downloadedSize = ko.observable(0);
		self.totalSize = ko.observable(0);
		/*self.videoUrl = ko.computed(function() {
			if (self.IsFinish()) {
				return plus.io.convertLocalFileSystemURL(self.localpath()); //转换为绝对路径方可显示
			} else {
				return common.gVideoServerUrl + self.videopath();
			}
		});*/
		self.videoHtml = ko.computed(function() {
			if (self.IsFinish()) {
				//console.log('<div class="video-js-box" style="margin:18px auto"><video controls width="' + 320 + 'px" height="' + 240 + 'px" class="video-js" data-setup="{}"><source src="' + plus.io.convertLocalFileSystemURL(self.localpath()) + '" type="video/mp4" /></video></div>');
				return '<div class="video-js-box" ><video controls width="' + 100 + '" height="' + 90 + '" class="video-js" poster="' + worksObj.workimgUrl + '" data-setup="{}"><source src="' + plus.io.convertLocalFileSystemURL(self.localpath()) + '" type="video/mp4" /></video></div>';
				//return plus.io.convertLocalFileSystemURL(self.localpath()); //转换为绝对路径方可显示
			} else {
				return '<div class="video-js-box" ><video controls width="' + 100 + '" height="' + 90 + '" class="video-js" poster="' + worksObj.workimgUrl + '" data-setup="{}"><source src="' + common.gVideoServerUrl + self.videopath() + '" type="video/mp4" /></video></div>';
				//return common.gVideoServerUrl + self.videopath();
			}
		});

		self.Percentage = ko.computed(function() {
			return self.totalSize() == 0 ? '0%' : Math.round(self.downloadedSize() / self.totalSize() * 100).toString() + '%';
		});
	}

	//获取下载列表
	self.getWorks = function() {
		self.downloadList.removeAll();
		var oldTasks = plus.storage.getItem(common.gVarLocalDownloadTask);
		var result = eval("(" + oldTasks + ")");
		//console.log(JSON.stringify(result));
		if (result) {
			for(var i = result.length - 1; i >= 0; i--){
				var obj = new worksItem(result[i]);
				self.downloadList.push(obj);
			}
			/*result.forEach(function(item) {
				var obj = new worksItem(item);
				self.downloadList.push(obj);
			});*/
			//console.log(JSON.stringify(self.downloadList()));
			VideoJS.setupAllWhenReady();
			arrDownloaderTask = download.initTasks(refreshdownloadState);
		}
		common.showCurrentWebview();
	};

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshdown').pullRefresh().endPulldownToRefresh(); //refresh completed
			self.getWorks();
		}, 1500);
	}
	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//删除下载任务及作品
	self.cancelTask = function(data) {
		if (data.IsFinish() == false) {
			if (typeof arrDownloaderTask != "undefined" && arrDownloaderTask.length > 0) {
				arrDownloaderTask.forEach(function(task) {
					if (task.url.indexOf('workId=' + data.works.ID) > 0) {
						if (task.state == 3) {
							mui.toast("下载已开始，无法取消");
							return;
						} else {
							var btnArray = ['是', '否'];
							mui.confirm('确认取消吗', '您点击了取消', btnArray, function(e) {
								if (e.index == 0) {
									task.abort();
									mui.toast("成功取消了本次下载");
									download.deleteTask(data.works.ID);
									self.downloadList.remove(data);
								}
							});
						}
					}
				})
			} else {
				var btnArray = ['是', '否'];
				mui.confirm('确认取消吗', '您点击了取消', btnArray, function(e) {
					if (e.index == 0) {
						mui.toast("成功取消了本次下载");
						download.deleteTask(data.works.ID);
						self.downloadList.remove(data);
					}
				});
			}

		}
	}

	self.removeTasks = function(data) {
		var evt = event;
		if(!common.setDisabled()) return;
		
		var btnArray = ['是', '否'];
		mui.confirm("确认删除吗", "你点击了删除", btnArray, function(e) {
			if (e.index == 0) {
				mui.toast("成功删除了下载");
				download.deleteTask(data.works.workId);
				self.downloadList.remove(data);
			}
			common.setEnabled(evt);
		})
	}
	

	
	//跳转至所有作品
	self.gotoAllWorks = function() {
		common.transfer("worksListAllHeader.html",false,{
			WorkUserType:common.gDictUserType.teacher
		},false,false);
	};

	mui.plusReady(function() {
		self.getWorks();
		//videoModule='<div class="video-js-box" style="margin:18px auto"><video controls width="' + 320 + 'px" height="' + 240 + 'px" class="video-js" poster="' + self.downloadList().workimgUrl + '" data-setup="{}"><source src="' + common.gVideoServerUrl + self.downloadList().videopath + '" type="video/mp4" /></video></div>';
	});
}
ko.applyBindings(mydownload);