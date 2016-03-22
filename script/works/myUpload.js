var myUpload = function() {
	var self = this;
	var arrUploadTask = [];
	self.uploadList = ko.observableArray([]);

	mui.init({
		pullRefresh: {
			container: '#pullrefreshdown',
			down: {
				callback: pulldownRefresh
			}
		}
	});

	var setItemFinish = function(item, returnJson) {
		var url = common.gServerUrl + "API/PolyvCloud/SetUploadFinish";
		console.log(url);
		mui.ajax(url, {
			type: 'PUT',
			data: {
				SourceID: item.works.ID,
				ReturnJsonPolyv: returnJson
			},
			success: function(responseText) {
				console.log('111:' + responseText);
				var result = JSON.parse(responseText);
				console.log(typeof result);
				console.log(result.VidPolyv);
				if (result) {
					console.log('222:' + JSON.stringify(item));
					item.IsFinish(true);
					//更换缩略图
					item.VideoThumbnail('');
					item.VideoThumbnail(result.ThumbnailPolyv);
					console.log(result.ThumbnailPolyv);
					item.works.VidPolyv = result.VidPolyv;
					console.log('333:' + JSON.stringify(item.works));

					//从本地缓存中删除
					upload.deleteTask(item.works.ID);
					mui.toast('上传完成');
				} else {
					mui.toast('保存时发生错误，请重试');
				}
			},
			error: function() {
				mui.toast('保存时发生错误，请重试');
			}
		});
	}

	/**
	 * 刷新上传进度
	 * @param {Object} task 上传任务。{workId: 作品ID, uploadTask: plus.uploader.upload对象}
	 * @param {Boolean} finished 是否完成
	 * @param {String} description 描述（成功则为空字符串）
	 */
	var refreshUploadState = function(task, finished, description) {
		for (var i = 0; i < self.uploadList().length; i++) {
			var item = self.uploadList()[i];
			if (item.IsFinish()) continue; //已上传完成的无需刷新

			if (task.workId == item.works.ID) {
				if (item.UploadTask == null) item.UploadTask = task.uploadTask;
				//console.log(task.uploadTask.state);

				console.log(finished + '||' + description + '||' + JSON.stringify(task));
				if (finished && common.StrIsNull(description) == '') {
					item.UploadedSize(item.TotalSize());

					var ret = JSON.parse(task.uploadTask.responseText);
					var returnJson = ret ? JSON.stringify(ret.data) : "";

					setItemFinish(item, returnJson);

					continue;
				}

				if (item.TotalSize() <= 0 && task.uploadTask.totalSize > 0) {
					item.TotalSize(task.uploadTask.totalSize);
				}
				item.UploadedSize(task.uploadTask.uploadedSize);
			}
		}
	}

	//根据状态对上传任务进行重新梳理
	self.filterTasks = function() {
        alert(common.gVarLocalUploadTask);
		var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
        alert(tmp);
		var arrRet = [];
		var tasks = JSON.parse(tmp);
		for (var i = 0; i < self.uploadList().length; i++) {
			var found = false;
			if (tasks && tasks.length > 0) {
				for (var j = tasks.length - 1; j >= 0; j--) {
					if (tasks[j].workId == self.uploadList()[i].works.ID) {
						found = true;
						tasks[j].Found = true;
						if (self.uploadList()[i].works.IsFinish) { //若服务器端认为已完成，则需清除本地该任务
							tasks.pop(tasks[j]);

							break;
						} else {
							self.uploadList()[i].TaskStatusText('上传中');
						}
					}
				}
			}

			if (!found) { //服务器端并无保存该上传任务
				if (self.uploadList()[i].works.IsFinish) {
					self.uploadList()[i].TotalSize(1);
					self.uploadList()[i].UploadedSize(1);
					if (self.uploadList()[i].ConvertResult() == 1) { //转换成功
						self.uploadList()[i].TaskStatusText('上传完成');
					} else if (self.uploadList()[i].ConvertResult() == 2) { //转换失败
						self.uploadList()[i].TaskStatusText('审核未通过');
						self.uploadList()[i].TaskStatus(false);
						self.uploadList()[i].CanDelete(true);
					} else {
						self.uploadList()[i].TaskStatusText('待审核');
						self.uploadList()[i].CanDelete(true);
					}
				} else {
					self.uploadList()[i].TaskStatusText('上传已失效');
					self.uploadList()[i].TaskStatus(false);
					self.uploadList()[i].CanDelete(true);
				}
			}
		}

		for (var j = tasks.length - 1; j >= 0; j--) {
			if (tasks[j].Found == "undefined" || tasks[j].Found == false) {
				tasks.pop(tasks[j]);
			}
		}
		plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(tasks));
		if (tasks && tasks.length > 0) {
			arrUploadTask = upload.initTasks(refreshUploadState);
		}
	}

	//停止任务（h5+有bug，暂时无法实现）
	self.handleTask = function(data) {
		if (data.IsFinish() == false) {

			arrUploadTask.forEach(function(task) {
				if (task.workId == data.works.ID) {
					task.abort();
					//console.log(task.state);
					/*switch(task.state){
						case 0:				//初始状态
							task.start();	//管用
							break;
						case 5:				//暂停状态
							task.resume();	//plus的bug，无效
							break;
						default:
							task.resume();	//abort和resume均为bug，无效
							break;
					}*/
				}
			})
		}
	}

	//取消任务
	self.cancelTask = function(data) {
		if (data.IsFinish() == false || data.ConvertResult() != 1) {
			var btnArray = ['是', '否'];
			mui.confirm('确认取消吗', '您点击了取消', btnArray, function(e) {
				if (e.index == 0) {
					mui.ajax(common.gServerUrl + 'Common/Work/' + data.works.ID, {
						type: 'DELETE',
						success: function(responseText) {
							mui.toast('成功取消了本次上传');
							upload.deleteTask(data.works.ID);

							self.uploadList.remove(data);
						}
					});
				}
			});
		}
	}

	//添加作品
	self.gotoAddWorks = function() {
		common.transfer("addWorks.html", true, {});
	};

	/**
	 * 根据作品实例对象返回用于显示的视图模型
	 * @param {Object} worksObj 作品实例
	 */
	var worksItem = function(worksObj) {
		var self = this;
		self.works = worksObj;
		self.WorkID = ko.observable(worksObj.ID); //作品编码
		self.workTitle = ko.observable(worksObj.Title); //作品标题
		self.workimgUrl = ko.observable(worksObj.workimgUrl); //缩略图
		self.videopath = ko.observable(worksObj.videopath); //视频路径
		self.localpath = ko.observable(worksObj.localpath); //本地路径
		self.IsFinish = ko.observable(worksObj.IsFinish); //专门用ko变量记录，便于更新*/
		self.ConvertResult = ko.observable(worksObj.ConvertResult); //作品转换结果，0-未处理；1-转换成功；2-转换失败
		self.IsChecked = ko.observable(false); //标记是否选中
		self.UploadedSize = ko.observable(0);
		self.TotalSize = ko.observable(0);
		self.CanDelete = ko.observable(false); //可删除（只要未完成上传均可删除）
		self.TaskStatus = ko.observable(true); //任务状态（true-正常；false-不正常）
		self.TaskStatusText = ko.observable(''); //任务状态文字
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
			return self.TotalSize() == 0 ? '0%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		});
	}

	//获取未完成的上传列表
	self.getUnfinishedWorks = function() {
		mui.ajax(common.gServerUrl + 'Common/Work/GetUnfinishedWorks?userID=' + getLocalItem('UserID'), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.uploadList.removeAll(); //先移除所有
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var obj = new worksItem(item);
						self.uploadList.push(obj);
						//console.log(obj.VideoThumbnail());
					})
                    mui('#pullrefreshdown').pullRefresh().refresh(true); //重置上拉加载
 					self.filterTasks();

					common.showCurrentWebview();
				} else {
					common.showCurrentWebview();
				}
			},
			error: function() {
				common.showCurrentWebview();
			}
		});
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

	mui.plusReady(function() {
		self.getUnfinishedWorks();
		//videoModule='<div class="video-js-box" style="margin:18px auto"><video controls width="' + 320 + 'px" height="' + 240 + 'px" class="video-js" poster="' + self.uploadList().workimgUrl + '" data-setup="{}"><source src="' + common.gVideoServerUrl + self.uploadList().videopath + '" type="video/mp4" /></video></div>';
	});
}
ko.applyBindings(myUpload);