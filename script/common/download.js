var download = download || {};

/**
 * 下载视频
 * @param 
 * @param {Object} downtask 下载任务
 * @param {Function} callback 状态改变时的回调函数
 */
download.downloadVideo = function(downtask, callback) {
	//console.log(JSON.stringify(downtask));
	var downurl = downtask.videopath;
	var taskTitle = downtask.workTitle;
	var authorname = downtask.workAuthorName;
	//var localpath = "_musicCommenter/download/" + "(" + authorname + ")" + taskTitle + ".mp4";
	var localpath = "(" + authorname + ")" + taskTitle + downtask.workId.toString() + ".mp4";
	var downloadTmp = plus.downloader.createDownload(downurl, {
		method: "GET",
		filename: localpath
	}, function(task, status) {
		if (status == 200) {
			//console.log('task: '+JSON.stringify(task));
			callback(task, true);
		}
	});

	downloadTmp.addEventListener("statechanged", function(task, responseStatus) {
		callback(task);
	}, false);
	downloadTmp.start();
	//return downloadTmp;
}

/**
 * 枚举下载任务 
 * @param {Number} stats 视频状态 3--正在下载的任务  4--已完成的任务  5--暂停下载的任务  
 */
download.alreadyDowntasks = function() {
	/*plus.downloader.enumerate(function() {
		
	}, stats);*/
	var result;
	plus.downloader.enumerate(function(itemArray) {
		result = itemArray;
	});
	return result;
}

/**
 * 根据作品ID删除下载任务
 * @param {Int} workId 作品ID
 */
download.deleteTask = function(workId){
	//从本地缓存中删除
	var tmp = plus.storage.getItem(common.gVarLocalDownloadTask);
	var tasks = JSON.parse(tmp);
	for (var j = 0; j < tasks.length; j++) {
		if (tasks[j].workId == workId) {
			tasks.pop(tasks[j]);
			break;
		}
	}
	plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(tasks));
}


/**
 * 初始化上传任务
 * @param {Function} callback 状态改变时的回调函数
 */
download.initTasks = function(callback) {
	/*plus.downloader.clear();
	plus.storage.setItem(common.gVarLocalDownloadTask, '');
	return;*/

	var tmp = plus.storage.getItem(common.gVarLocalDownloadTask);
	if (common.StrIsNull(tmp) == '') return;

	var tasks = JSON.parse(tmp);
	if (tasks.length > 0) {
		tasks.forEach(function(item) {
			if(!item.IsFinish)
				download.downloadVideo(item, callback);
		})
	}
}