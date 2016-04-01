var myUpload = function() {
	var self = this;
	self.uploadList = ko.observableArray([]);

	mui.init({
		pullRefresh: {
			container: '#pullrefreshdown',
			down: {
				callback: pulldownRefresh
			}
		}
	});

	/**
	 * 上传完成提交返回的vid至服务器
	 * @param {Object} item 本地缓存的上传任务
	 * @param {String} vid 视频对应保利威视平台的vid
	 * @param {String} returnJson 上传完成返回的视频信息（目前Android sdk可返回，iOS不能）
	 */
	var setItemFinish = function(item, vid, returnJson) {
		var retJson = '';
		if(typeof returnJson == "undefined"){
			retJson = "";
		}
		else{
			var tmp = JSON.parse(returnJson);
			//alert(returnJson);
			if(tmp.error != 0){		//发生错误
				item.IsFinish(true);
				upload.deleteTask(item.works.ID);
				mui.toast('上传出错');
				return;
			}
			
			if(typeof tmp.data != 'undefined'){
				retJson = JSON.stringify(tmp.data);
			}
		}
		//alert(retJson);
		var url = common.gServerUrl + "API/PolyvCloud/SetUploadFinish";
		mui.ajax(url, {
			type: 'PUT',
			data: {
				SourceID: item.works.ID,
				VidPolyv: vid,
				ReturnJsonPolyv: retJson
			},
			success: function(responseText) {
				var result = JSON.parse(responseText);
				if (result) {
					item.IsFinish(true);
					//更换缩略图（加上延时，无效，暂取消）
					/*if(common.StrIsNull(result.ThumbnailPolyv) != ''){
						setTimeout(function(){
							item.videoThumbnail(result.ThumbnailPolyv);		//上传完成并未有缩略图，编码完成会有
						}, 1000);
					}*/
					
					item.works.VidPolyv = result.VidPolyv;

					//从本地缓存中删除
					upload.deleteTask(item.works.ID);
					mui.toast('上传完成，请等待审核');
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
	 * 刷新处理状态
	 */
	var refreshHandleState = function() {
		var workIds = '';
		for (var i = 0; i < self.uploadList().length; i++) {
			var item = self.uploadList()[i];
			if (item.IsFinish() == false || item.ConvertResult() != common.gDictAttachmentConvertResult.Succeeded) {
				if (workIds == '') {
					workIds += item.WorkID().toString();
				} else {
					workIds += ',' + item.WorkID().toString();
				}
			}
		}
		if (workIds == '') return;

		var url = common.gServerUrl + "API/Attachment/GetAttachmentStatus?workIds=" + encodeURI(workIds);
		//alert(url);
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				if (result && result.length > 0) {
					for (var i = 0; i < self.uploadList().length; i++) { //刷新处理状态
						var item = self.uploadList()[i];
						for (var j = 0; j < result.length; j++) {
							var item2 = result[j];
							if (item.WorkID() == item2.SourceID) {
								item.IsFinish(item2.IsFinish);
								item.ConvertResult(item2.ConvertResult);
								//alert(item2.ThumbnailPolyv);
								if(common.StrIsNull(item2.ThumbnailPolyv) != '' && item2.IsFinish)
									item.videoThumbnail(item2.ThumbnailPolyv); //从附件中获取，该字段为缩略图
								
								break;
							}
						}
					}
				}
			}
		});
	}

	/**
	 * 刷新上传进度
	 * @param {Object} task 上传任务。{workId: 作品ID, uploadTask: {isFinish: false, uploadedSize: 0, totalSize: 999, vid: '123', returnJson: {"error":"0","data":[vid: '', first_image: '']}}}
	 * @param {String} description 描述（成功则为空字符串）
	 */
	var refreshUploadState = function(task, description) {
		for (var i = 0; i < self.uploadList().length; i++) {
			var item = self.uploadList()[i];
			if (item.IsFinish()) continue; //已上传完成的无需刷新

			if (task.workId == item.works.ID) {
				//alert(JSON.stringify(task));
				if (task.uploadTask.isFinish && common.StrIsNull(description) == '') {
					item.UploadedSize(item.TotalSize());
					//alert(JSON.stringify(task));

					var vid = task.uploadTask.vid;
					setItemFinish(item, vid, task.uploadTask.returnJson);

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
		var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
		//alert('gVarLocalUploadTask: ' + tmp);
		
		//======初始化=======
		var tasks = JSON.parse(tmp);
		if(!tasks) {	//初始化为本地端并未存在
			for (var i = 0; i < self.uploadList().length; i++) {
				self.uploadList()[i].FoundInLocal(false);
			}
			return;
		}
		
		for (var j = tasks.length - 1; j >= 0; j--) {	//初始化为服务器端并未保存
			tasks[j].Found = false;
		}
		//==================
		
		for (var i = 0; i < self.uploadList().length; i++) {
			var found = false;
			if (tasks && tasks.length > 0) {
				for (var j = tasks.length - 1; j >= 0; j--) {
					if (tasks[j].workId == self.uploadList()[i].works.ID) {
						found = true;
						tasks[j].Found = found;
						if (self.uploadList()[i].works.IsFinish) { //若服务器端认为已完成，则需清除本地该任务
							tasks.pop(tasks[j]);
						}

						break;
					}
				}
			}

			self.uploadList()[i].FoundInLocal(found);

			if (!found && self.uploadList()[i].works.IsFinish) { //服务器端并无保存该上传任务
				self.uploadList()[i].TotalSize(1);
				self.uploadList()[i].UploadedSize(1);
			}
		}

		for (var j = tasks.length - 1; j >= 0; j--) {
			if (tasks[j].Found == "undefined" || tasks[j].Found == false) {
				tasks.pop(tasks[j]);
			}
		}
		if(tasks.length <= 0)
			plus.storage.setItem(common.gVarLocalUploadTask, '[]');
		else
			plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(tasks));
		
		//alert('local task:' + JSON.stringify(tasks));
		//alert('server task:' + JSON.stringify(self.uploadList()));
		
		if (tasks && tasks.length > 0) {
			upload.initTasks(refreshUploadState);
		}
	}

	//取消任务
	self.cancelTask = function(data) {
		if (data.CanDelete() == false) return;

		var btnArray = ['是', '否'];
		mui.confirm('确认删除本上传吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + 'Common/Work/' + data.works.ID, {
					type: 'DELETE',
					success: function(responseText) {
						mui.toast('成功删除了本次上传');
						upload.deleteTask(data.works.ID);

						self.uploadList.remove(data);
					}
				});
			}
		});
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
		self.videoThumbnail = ko.observable('../../images/video-big-default.png');
		if (common.StrIsNull(worksObj.VideoThumbnail) != '') {
			self.videoThumbnail(worksObj.VideoThumbnail); //缩略图
		}
		self.videopath = ko.observable(worksObj.videopath); //视频路径
		self.localpath = ko.observable(worksObj.localpath); //本地路径
		self.IsFinish = ko.observable(worksObj.IsFinish); //专门用ko变量记录，便于更新*/
		self.ConvertResult = ko.observable(worksObj.ConvertResult); //作品转换结果，0-未处理；1-转换成功；2-转换失败
		self.IsChecked = ko.observable(false); //标记是否选中
		self.UploadedSize = ko.observable(0);
		self.TotalSize = ko.observable(0);
		self.FoundInLocal = ko.observable(true); //本地任务中存在
		self.CanDelete = ko.computed(function() { //可删除（已完成上传的不可删除）
			if (self.IsFinish() == true && self.ConvertResult() == common.gDictAttachmentConvertResult.Succeeded) {
				return false;
			}

			return true;
		});
		self.TaskStatus = ko.computed(function() { //任务状态（完成但审核未通过、无缓存且未完成，均为不正常）
			if (self.IsFinish() == true && self.ConvertResult() == common.gDictAttachmentConvertResult.Failed) { //转换失败
				return false;
			}

			if (self.FoundInLocal() == false && self.IsFinish() == false) {
				return false;
			}

			return true;
		});
		self.TaskStatusText = ko.computed(function() { //任务状态文字
			if (self.IsFinish()) {
				if (self.ConvertResult() == common.gDictAttachmentConvertResult.Succeeded) { //转换成功
					return '上传完成';
				} else if (self.ConvertResult() == common.gDictAttachmentConvertResult.Failed) { //转换失败
					return '审核未通过';
				} else {
					return '待审核，约几分钟';
				}
			} else {
				if (self.FoundInLocal()) {
					return '上传中';
				} else {
					return '上传已失效';
				}
			}
		});

		self.Percentage = ko.computed(function() {
			if (self.IsFinish()) {
				return '100%';
			}
			return self.TotalSize() == 0 ? '0%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		});
	}

	//获取未完成的上传列表
	self.getUnfinishedWorks = function() {
		//alert('getting unfinish works');
		mui.ajax(common.gServerUrl + 'Common/Work/GetUnfinishedWorks?userID=' + getLocalItem('UserID'), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var exists = false;
						for (var j = self.uploadList().length - 1; j >= 0; j--) {
							var item2 = self.uploadList()[j];
							if(item.ID == item2.works.ID){
								exists = true;
								break;
							}
						}
						
						if(exists == false){
							var obj = new worksItem(item);
							self.uploadList.unshift(obj);
						}
					})
		
					mui('#pullrefreshdown').pullRefresh().refresh(true); //重置上拉加载
					//alert('before filter uploadList:' + JSON.stringify(self.uploadList()));
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
	
	//开始上传
	window.addEventListener('triggerUpload',function(){
		self.getUnfinishedWorks();
	});

	mui.plusReady(function() {
		//self.getUnfinishedWorks();
		//videoModule='<div class="video-js-box" style="margin:18px auto"><video controls width="' + 320 + 'px" height="' + 240 + 'px" class="video-js" poster="' + self.uploadList().workimgUrl + '" data-setup="{}"><source src="' + common.gVideoServerUrl + self.uploadList().videopath + '" type="video/mp4" /></video></div>';
	});
}
ko.applyBindings(myUpload);