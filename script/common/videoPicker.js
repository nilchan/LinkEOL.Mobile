var videoPicker = videoPicker || {};

//临时文件夹，保存临时视频处理文件
var tempPath = '_doc/temp/';

/**
 * 返回视频的视图模型
 * @param {String} srcPath 源文件的本地URL路径，可用于文件的读取
 * @param {String} fileName 上传时所用的文件名
 * @return {Object} 该视频对象
 */
videoPicker.returnVideoVM = function(srcPath, fileName) {
	var self = this;
	self.srcPath = srcPath;
	self.fileName = fileName;
}

//利用数组记录返回的视频路径
var _returnVideos = [];
//备份的回调函数
var _callback = null;

/**
 * 根据可用分辨率选择1280*720和640*480两种
 * @param {Array} arrRes 所有可用分辨率的数组
 */
getResolution = function(arrRes) {
	console.log(JSON.stringify(arrRes));
	if (arrRes && arrRes.length > 0) {
		var ret = [];
		arrRes.forEach(function(res) {
			if (res == '1280*720' || res == '640*480') {
				ret.push(res);
			}
		})

		return ret;
	} else {
		return [];
	}
}

/**
 * 生成临时文件名及路径
 * @param {int} index 标识，防止循环调用时返回相同的文件名
 * @return {String} 返回文件路径
 */
generateTempFilePath = function(index) {
	var rdm = Math.floor(Math.random() * 10000);
	var len = rdm.toString().length;
	while (len < 5) {
		rdm = "0" + rdm;
		len++;
	}
	var strIndex = index ? index : '0';
	return tempPath + (new Date()).getTime().toString() + strIndex + rdm;
}

/**
 * 选择视频（拍摄、相册选择）
 * @param {Boolean} multiple 是否多选
 * @param {Function} callback 回调函数
 * @return none
 */
videoPicker.SelectVideo = function(multiple, callback) {
	var self = this;
	self.videos = new mui.PopPicker();

	//备份回调函数
	if (callback) {
		_callback = callback;
	}

	//弹窗的json数据
	var videoData = [];

	//获取可用的分辨率及弹窗json数据
	var cmr = plus.camera.getCamera();
	var myRes = [];
	//if (plus.os.vendor == 'Apple') //只有在iOS才可以在录像前设置分辨率
		myRes = getResolution(cmr.supportedVideoResolutions);
	
	alert(JSON.stringify(myRes));
	var counter = 0;
	if (myRes.length > 0) {
		myRes.forEach(function(res) {
			var p = res.split('*')[1];
			if (p == '480') {
				p = '(高清' + p + 'p)'
			} else {
				p = '(超高清' + p + 'p)'
			}
			var obj = {
				value: counter,
				text: '拍摄' + p
			}
			counter++;
			videoData.push(obj);
		})
	}
	if (videoData.length <= 0) {
		videoData.push({
			value: counter,
			text: '拍摄'
		});
		counter++;
	}
	videoData.push({
		value: counter,
		text: '相册中选择'
	});
	cmr = null;

	//点击空白区域或取消按钮，直接释放本弹出框
	self.videos.mask[0].addEventListener('tap', function() {
		self.videos.dispose();
	}, false);
	self.videos.cancel.addEventListener('tap', function() {
		self.videos.dispose();
	}, false);

	self.videos.setData(videoData);

	/*//本地上传
	if (uploadType) {
		plus.gallery.pick(function(e) {
			_returnVideos = [];
			if (multiple && e.files) {
				var index = 0;
				e.files.forEach(function(item) {
					var videoVM = new self.returnVideoVM(item, generateTempFilePath(index));
					index++;
					_returnVideos.push(videoVM);
				})
			} else {
				var videoVM = new self.returnVideoVM(e, generateTempFilePath());
				_returnVideos.push(videoVM);
			}

			if (_callback) {
				_callback(_returnVideos);
			}
		}, function(e) {
			console.log(e.message);
		}, {
			filter: "video"
		});
	} else {
		//录像
		var res = myRes.length > 0 ? myRes[items[0].value] : '';
		var fmt = 'mp4';
		var cmr = plus.camera.getCamera();

		cmr.startVideoCapture(function(path) {
			_returnVideos = [];
			plus.gallery.save(path);
			var videoVM = new self.returnVideoVM(path, generateTempFilePath());
			_returnVideos.push(videoVM);

			if (_callback) {
				_callback(_returnVideos);
			}
		}, function(e) {
			console.log(e.message);
		}, {
			filename: "_doc/gallery/",
			index: 1,
			format: fmt,
			resolution: res
		});
	}*/

	self.videos.show(function(items) {
		if (items[0].value == counter) { //从相册选择
			plus.gallery.pick(function(e) {
				_returnVideos = [];
				if (multiple && e.files) {
					var index = 0;
					e.files.forEach(function(item) {
						var videoVM = new self.returnVideoVM(item, generateTempFilePath(index));
						index++;
						_returnVideos.push(videoVM);
					})
				} else {
					var videoVM = new self.returnVideoVM(e, generateTempFilePath());
					_returnVideos.push(videoVM);
				}

				if (_callback) {
					_callback(_returnVideos);
				}
			}, function(e) {console.log(e.message);}, {
				filter: "video"
			});
		}
		else { //拍摄
			if (plus.os.vendor == 'Apple'){
				alert('ios');
				var res = myRes.length > 0 ? myRes[items[0].value] : '';
				var fmt = 'mp4';
				var cmr = plus.camera.getCamera();
				console.log(cmr);
	
				cmr.startVideoCapture(function(path) {
					console.log(path);
					_returnVideos = [];
					plus.gallery.save(path);
					var videoVM = new self.returnVideoVM(path, generateTempFilePath());
					_returnVideos.push(videoVM);
	
					if (_callback) {
						_callback(_returnVideos);
					}
				}, function(e) {console.log(e.message);}, {
					filename: "_doc/gallery/",
					index: 1,
					format: fmt,
					resolution: res
				});
			}
			else{
				alert('android');
				plus.VideoUtility.recordVideo(640, 480, 500*1024, function(arg){
					alert(arg);
					if(arg && arg.status == true){
						var videoVM = new self.returnVideoVM(arg.value, generateTempFilePath());
						_returnVideos.push(videoVM);
		
						if (_callback) {
							_callback(_returnVideos);
						}
					}
				}, function(error){
					mui.toast('拍摄出错');
				})
			}
		}

		self.videos.dispose();
	});
}