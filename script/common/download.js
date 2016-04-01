var download = download || {};

/**
 * 下载视频
 * @param 
 * @param {Object} downtask 下载任务
 * @param {Function} callback 状态改变时的回调函数
 */
download.downloadVideo = function(downtask, callback) {
	//alert(downtask.workVidPolyv);
	console.log('plus: '+plus);
	console.log('plus.VideoUtility: '+plus.VideoUtility);
	mui.plusReady(function() {
		plus.VideoUtility.DownloadVideo(downtask.workVidPolyv, common.gJsonVideoLevel.SD, function(arg) {
			//alert(JSON.stringify(arg));
			var retObj = {
				downloadTask: arg,
				workId: downtask.workId
			}
			callback(retObj);
		}, function(error) {
			//alert(error);
			callback({}, '下载失败，请重试');
		});
	});
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
	//console.log('deleteTask: ' + JSON.stringify(tasks));
	plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(tasks));
}

/**
 * 初始化下载任务
 * @param {Function} callback 状态改变时的回调函数
 */
download.initTasks = function(callback) {
	var tmp = plus.storage.getItem(common.gVarLocalDownloadTask);
	if (common.StrIsNull(tmp) == '') return;
	//console.log('initTasks: '+tmp);
	var tasks = JSON.parse(tmp);
	if (tasks.length > 0) {
		tasks.forEach(function(item) {
			//console.log('before upload item: '+JSON.stringify(item));
			/* ==标记已开始上传。再次进入无需再上传，而是自动上传== */
			if(item.isFinish == false && item.downloading != true){
				item.downloading = true;
				plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(tasks));
				
				download.downloadVideo(item, callback);
			}
			/* ================================================= */
		})
	}
}