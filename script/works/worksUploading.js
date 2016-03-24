/**
 * 获取任务状态中文描述
 * @param {int} state 任务状态
 */
var getStateStr = function(state) {
	switch (state) {
		case 0:
			return "准备中";
		case 1:
			return "请求连接...";
		case 2:
			return "已建立连接";
		case 3:
			return "传输中";
		case 4:
			return "已完成";
		case 5:
			return "暂停中";
		default:
			return "";
	}
}

var uploadVideoUrl = common.gServerUrl + 'API/Video/Upload';

/**
 * 上传视频
 * @param {String} path 视频路径
 * @param {String} name 视频上传时的唯一名称
 * @param {int} userid 上传者UserID
 * @param {int} workid 视频对应作品的ID
 */
var uploadVideo = function(path, name, userid, workid, workstitle) {
	var url = uploadVideoUrl + '?userId=' + userid + '&workId=' + workid;
	var uploadTmp = plus.uploader.createUpload(url, {
		method: "POST",
		blocksize: 102400
	}, function(ul, status) {	//上传完成后的回调
		//console.log(ul.getFileName())
		console.log(status);
	});

	uploadTmp.setRequestHeader('Authorization', getAuth()); //加上请求的认证信息
	//uploadTmp.setRequestHeader('Customer', workstitle); //记录作品标题
	uploadTmp.addEventListener("statechanged", function(ul, responseStatus) {
		refreshTask(ul);
		//console.log("upload:" + JSON.stringify(ul) + "State: " + ul.state + " , Status: " + responseStatus);
	}, false);

	var addResult = uploadTmp.addFile(path, {
		key: name
	});

	if (addResult) {
		uploadTmp.start();
		return uploadTmp;
	}
}

/**
 * 获取所有未完成的上传任务（会产生错误，暂未用）
 */
var getAllUploads = function() {
	plus.uploader.enumerate(function(arr) {
		console.log('arr');
		mui.toast("arr");
		//self.tasks(arr);
	});
}

/**
 * 根据Upload对象返回用于显示的视图模型
 * @param {Object} uploadObj plus.uploader.Upload对象
 * @param {String} title 对应作品标题
 */
var uploadItem = function(uploadObj, title) {
	var self = this;

	self.url = uploadObj.url; //用作标识
	self.WorkTitle = title;
	self.State = ko.observable(uploadObj.state);
	self.StateText = ko.computed(function() {
		return getStateStr(self.State())
	});
	self.UploadedSize = ko.observable(uploadObj.uploadedSize);
	self.TotalSize = ko.observable(uploadObj.totalSize);
	self.Ratio = ko.computed(function() {
		/*if (self.TotalSize() > 1024 * 1024) {*/
			var de = (Math.round(self.TotalSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			var nu = (Math.round(self.UploadedSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			return nu + '/' + de;
		/*} else {
			var de = (Math.round(self.TotalSize() * 100 / 1024) / 100).toString() + 'K';
			var nu = (Math.round(self.UploadedSize() * 100 / 1024) / 100).toString() + 'K';
			return nu + '/' + de;
		}*/
	});
	self.Percentage = ko.computed(function() {
		//console.log('UploadedSize:' + self.UploadedSize());
		return self.TotalSize() == 0 ? '100%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		//return '100%';
	});
	self.LastTime = ko.observable(new Date().getTime());	//时间戳，单位为毫秒
	self.Counter = ko.observable(0);	//计数器，避免太频繁的刷新
	self.LastUploadedSize = ko.observable(0);	//上一次记录时所上传的文件大小
	self.Speed = ko.observable('0 K/s');	//上传速率
}

/**
 * 刷新进度（目前似乎有卡顿的情况出现，待解决）
 * @param {Object} task plus的Upload对象
 */
var refreshTask = function(task) {
	self.tasks().forEach(function(item) {
		if (item.url == task.url) {
			item.Counter(item.Counter() + 1);
			var now = new Date().getTime();
			if(task.state != 3){
				item.LastTime(now);
			}
			if(task.state == 3 && (item.Counter() >= 600 || (now - item.LastTime() > 300))){	//开始传输，定时刷新
				item.Counter(0);
				var size = item.UploadedSize() - item.LastUploadedSize();
				var time = now - item.LastTime();
				var speed = '0 K/s';
				if(time > 0){
					speed = Math.round(size * 1000 * 100 / 1024 / time) / 100;		//2位小数点，单位为K/s
					if (speed > 1024) {
						speed = (Math.round(speed * 100 / 1024) / 100).toString() + ' M/s';	//2位小数点，单位为M/s
					}
					else{
						speed = speed.toString() + ' K/s';
					}
				}
				item.Speed(speed);
				//console.log(size + ' ' + time + ' ' + item.Speed());
				
				item.LastUploadedSize(item.UploadedSize());
				item.LastTime(now);
				//console.log('LastUploadedSize:' + item.LastUploadedSize());
			}
			
			item.State(task.state);
			if(item.TotalSize() <= 0){
				item.TotalSize(task.totalSize);
			}
			item.UploadedSize(task.uploadedSize);
			
			return;
		}
	})
}

var viewModel = function() {
	var self = this;

	self.tasks = ko.observableArray([]); //所有上传任务对象

	/**
	 * 获取所有未完成的上传任务
	 */
	/*self.getAllUploads = function(){
		plus.uploader.enumerate(function(uploads){
			console.log('arr'+uploads.length);
			self.tasks(uploads);
		});
	}*/

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		console.log(web.workId + '|' + web.videoPath + '|' + web.videoName);

		if (typeof(web.workId) !== "undefined" && typeof(web.videoPath) !== "undefined" && typeof(web.videoName) !== "undefined") {
			var workId = web.workId;
			var videoPath = web.videoPath;
			var videoName = web.videoName;
			var worksTitle = web.worksTitle;

			var ret = uploadVideo(videoPath, videoName, getLocalItem("UserID"), workId.toString(), worksTitle);

			if (ret) {
				var obj = new uploadItem(ret, worksTitle);
				self.tasks.push(obj);
			}
		}

		//getAllUploads();
		plus.uploader.enumerate(function(uploads){
			console.log('arr'+uploads.length);
			mui.toast('arr'+uploads.length);
			//self.tasks(uploads);
		});
	});
	
	self.gotoAddWorks = function() {
		common.transfer('../../modules/works/addWorks.html', true);
	};
}
ko.applyBindings(viewModel);