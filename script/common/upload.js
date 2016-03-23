var upload = upload || {};

var offset = 0; //上传的起始位置（按字节）
var uploadVideoUrl = common.gVideoServerUrl + 'API/Video/Upload';
var getOffsetUrl = common.gVideoServerUrl + 'API/Video/GetVideoOffset';
var uploadVideoUrl_Polyv = "http://v.polyv.net/uc/services/rest?method=uploadfile";
var uploadVideoUrl_PolyvResumable = "http://upload.polyv.net:1080/files/";

var getUint8ArrayFromBase64 = function(base64) {
	var bin = atob(base64.split(',')[1]);
	var mime = base64.split(',')[0].match(/:(.*?);/)[1];
	//创建空的Uint8Array
	var arr = new Uint8Array(bin.length);
	//将图像数据逐字节放入Uint8Array中
	for (var i = 0; i < bin.length; i++) {
		arr[i] = bin.charCodeAt(i);
	};

	return arr;
}

//判断是否支持HTML5上传
var supportHTML5Upload = function() {
	return supportFileAPI() && supportAjaxUploadProgressEvents() && supportFormData() && supportBlobType();

	function supportFileAPI() {
		var fi = document.createElement('INPUT');
		fi.type = 'file';
		return 'files' in fi;
	};

	function supportAjaxUploadProgressEvents() {
		var xhr = new XMLHttpRequest();
		return !!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
	};

	function supportFormData() {
		return !!window.FormData;
	};

	function supportBlobType() {
		try {
			var tmp = new Blob();
			return true;
		} catch (e) {
			return false;
		}
	}
}
var compatible = supportHTML5Upload();

//######## 保利威视断点续传方式 ########
(function() {
	/**
	 * 
	 * @param {Object} opts 参数（userId/ts/hash/filePath/workId/task/callback）
	 */
	var polyvUploadResumable = function(opts) {
		var self = this;

		var videoFile; //视频文件
		var fileExt = 'mp4';
		var fileLocation = '';

		self.startUpload = function() {
			plus.io.resolveLocalFileSystemURL(opts.filePath, function(entry) {
				entry.file(function(file) {
					videoFile = file;
					var arr = videoFile.name.split('.');
					if (arr.length > 1) {
						fileExt = arr[arr.length - 1];
					}
					self.step1_Post();
				});
			}, function(e) {
				console.log("获取文件出错：" + e.message);
			});
		}
		console.log(JSON.stringify(opts));

		var processStatusText; //处理状态文字

		//提交空POST，用以创建文件，获取上传地址及vid
		self.step1_Post = function() {
			var data = 'title=' + videoFile.name + '&tag=&desc=&ext=' + fileExt + '&cataid=';

			var xhr = new XMLHttpRequest();
			//processStatusText = '上传中...';
			xhr.addEventListener('load', function() {
				console.log(JSON.stringify(xhr));
				fileLocation = xhr.getResponseHeader('Location');
				console.log('fileLocation: ' + fileLocation);
				if (fileLocation) { //获取到远程文件的有效路径
					self.step2_Head();
				}
			}, false);
			xhr.upload.addEventListener('error', function() {
				console.log('error: ' + xhr.responseText);
			}, false);

			xhr.open('POST', opts.task.url);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
			xhr.setRequestHeader('Final-Length', videoFile.size.toString());
			xhr.setRequestHeader('userid', opts.userId);
			xhr.setRequestHeader('ts', opts.ts);
			xhr.setRequestHeader('hash', opts.hash);

			xhr.send(data);
		}

		//利用HEAD请求获取文件的偏移量（offset）
		self.step2_Head = function() {
			var xhr = new XMLHttpRequest();
			//processStatusText = '上传中...';
			xhr.addEventListener('load', function() {
				var offset = xhr.getResponseHeader('Offset');
				var bytesWritten = offset ? parseInt(offset, 10) : 0;
				if (!compatible) { //若不支持html5上传，则每次都完整上传
					bytesWritten = 0;
				}
				console.log('offset, bytesWritten: ' + offset + ' ' + bytesWritten);
				self.step3_Patch(bytesWritten, videoFile.size - 1);
			}, false);
			xhr.upload.addEventListener('error', function() {
				console.log('error: ' + xhr.responseText);
			}, false);
			xhr.open('HEAD', fileLocation);
			xhr.send();
		}

		//利用PATCH开始上传
		self.step3_Patch = function(startBytes, endBytes) {
			/*var slice = videoFile.slice || videoFile.webkitSlice || videoFile.mozSlice;
    		var blob  = compatible ? slice.call(videoFile, startBytes, endBytes + 1, videoFile.type) : videoFile;*/
			var blob = videoFile; //.slice(startBytes, endBytes + 1);
			//console.log('blob size: ' + blob.size);

			/*var xhr = new XMLHttpRequest();
			//processStatusText = '上传中...';
			xhr.addEventListener('load', function() {
				console.log(JSON.stringify(xhr));
				alert('上传完成');
			}, false);
			xhr.upload.addEventListener('progress', function(e) {
				if (e.lengthComputable) {
					uploadPercentage = e.loaded * 100 / e.total;
					console.log(uploadPercentage);
				}
			}, false);
			xhr.upload.addEventListener('error', function() {
				console.log('error: ' + xhr.responseText);
			}, false);
			xhr.open('PATCH', fileLocation);
			xhr.setRequestHeader('Offset', startBytes);
			xhr.setRequestHeader('Content-Type', 'application/offset+octet-stream');
			//xhr.setRequestHeader('writeToken', opts.writeToken);
			xhr.send(blob);*/

			var uploadTmp = plus.uploader.createUpload(fileLocation, {
				method: "POST"
			}, function(ul, status) { //上传完成后的回调
				//console.log(JSON.stringify(ul));
				//上传成功
				if (status == 200) console.log(JSON.stringify(ul)); //callback(ul, true);
			});
			uploadTmp.addEventListener("statechanged", function(ul, responseStatus) {
				console.log(JSON.stringify(ul));
				//callback(ul);
			}, false);

			var addResult = uploadTmp.addFile(opts.filePath, {
				key: 'Filedata'
			});
			if (addResult) {
				uploadTmp.setRequestHeader('Content-Type', 'application/offset+octet-stream');
				uploadTmp.setRequestHeader('Offset', startBytes.toString());
				uploadTmp.setRequestHeader('Polyv-Method-Override', 'PATCH');

				uploadTmp.start();
				return uploadTmp;
			}
		}

		return (this);
	};

	window.polyvUploadResumable = polyvUploadResumable;

})();
//####################################


//########## 保利威视直传方式 ##########
(function() {
	/**
	 * 
	 * @param {Object} opts 参数（userId/writeToken/ts/hash/filePath/workId/task/callback）
	 */
	var polyvUpload = function(opts) {
		var self = this;

		var videoFile; //视频文件
		var fileExt = 'mp4';

		self.startUpload = function() {
			plus.io.resolveLocalFileSystemURL(opts.filePath, function(entry) {
				entry.file(function(file) {
					videoFile = file;
					var arr = videoFile.name.split('.');
					if (arr.length > 1) {
						fileExt = arr[arr.length - 1];
					}
					self.uploadFile();
				});
			}, function(e) {
				opts.callback({}, true, '读取视频文件失败');
				console.log("获取文件出错：" + e.message);
			});
		}
		console.log(JSON.stringify(opts));

		var processStatusText; //处理状态文字

		//直接POST整个文件
		self.uploadFile = function() {
			var uploadTmp = plus.uploader.createUpload(uploadVideoUrl_Polyv, {
				method: "POST"
			}, function(ul, status) { //上传完成后的回调
				console.log(JSON.stringify(ul));
				var retObj = {
					uploadTask: ul,
					workId: opts.workId
				}
				if (status == 200) { //上传成功
					opts.callback(retObj, true, '');
				} else { //上传失败
					opts.callback(retObj, true, '发生错误请重试');
				}
			});
			uploadTmp.addEventListener("statechanged", function(ul, responseStatus) {
				//console.log(JSON.stringify(ul));
				opts.callback({
					uploadTask: ul,
					workId: opts.workId
				});
			}, false);

			var addResult = uploadTmp.addFile(opts.filePath, {
				key: 'Filedata'
			});
			if (addResult) {
				uploadTmp.addData('writetoken', opts.writeToken);
				uploadTmp.addData('cataid', '1');
				uploadTmp.addData('JSONRPC', '{"title": "' + opts.workId + '", "tag": "", "desc": ""}');
				uploadTmp.start();
			}
		}

		return (this);
	};

	window.polyvUpload = polyvUpload;

})();
//####################################


//########## 保利威视SDK方式 ##########
(function() {
	/**
	 * 
	 * @param {Object} opts 参数（userId/writeToken/ts/hash/filePath/workId/task/callback）
	 */
	var polyvUploadSDK = function(opts) {
		var self = this;

		self.startUpload = function() {
            self.uploadFile();
		}

		var processStatusText; //处理状态文字

		self.uploadFile = function() {
			plus.VideoUtility.UploadVideo(opts.filePath, opts.workId.toString(), '', function(arg) {
				var retObj = {
					uploadTask: arg,
					workId: opts.workId
				}
				
				opts.callback(retObj);
			}, function(error) {
				opts.callback({}, '上传失败，请重试');
			});
		}

		return (this);
	};

	window.polyvUploadSDK = polyvUploadSDK;

})();
//####################################


/**
 * 上传视频
 * @param {Object} localItem 本地缓存的上传任务对象（workId/workType/videoPath/videoServerType/uploadInfoJson[userId/ts/hash]）
 * @param {Function} callback 状态改变时的回调函数
 */
upload.uploadVideo = function(localItem, callback) {
    alert(localItem.uploadInfoJson);
	if (localItem.videoServerType != 3) { //非保利威视云视频，暂不支持
		return null;
	}

	var task = null;
	//视频服务器所需信息
	var uploadInfo = JSON.parse(localItem.uploadInfoJson);
	if (uploadInfo) {
		var pUpload = polyvUploadSDK({
			workId: localItem.workId,
			filePath: localItem.videoPath,
			userId: uploadInfo.userId,
			writeToken: uploadInfo.writeToken,
			ts: uploadInfo.ts,
			hash: uploadInfo.hash,
			callback: callback
		});

		pUpload.startUpload();

		task = { //上传任务
			workId: localItem.workId,
			state: 0,
			totalSize: 0,
			uploadedSize: 0
		};
	}

	return task;
}

/**
 * 初始化上传任务
 * @param {Function} callback 状态改变时的回调函数
 * @return {Array} 上传任务数组
 */
upload.initTasks = function(callback) {
	var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
	var arrRet = [];
	var tasks = JSON.parse(tmp);
	if (tasks && tasks.length > 0) {
		tasks.forEach(function(item) {
			var ret = upload.uploadVideo(item, callback);
			arrRet.push(ret);
		})
	}
	alert('initTasks:' + JSON.stringify(arrRet));
	return arrRet;
}

/**
 * 根据作品ID删除上传任务
 * @param {Int} workId 作品ID
 */
upload.deleteTask = function(workId) {
	//从本地缓存中删除
	var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
	console.log('deleteTask:' + tmp);
	var tasks = JSON.parse(tmp);
	if (tasks && tasks.length > 0) {
		for (var j = 0; j < tasks.length; j++) {
			if (tasks[j].workId == workId) {
				tasks.pop(tasks[j]);
				break;
			}
		}
		plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(tasks));
	}
}