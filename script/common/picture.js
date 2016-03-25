var picture = picture || {};

//临时文件夹，保存临时图片处理文件
var tempPath = '_doc/temp/';

/**
 * 返回图片的视图模型
 * @param {String} srcPath 源文件的本地URL路径，可用于文件的读取
 * @param {String} dstPath 转换后文件的本地URL路径
 * @param {String} imgbase64 返回图片的base64编码字符串
 * @param {Int32} len 返回图片的长度
 * @return {Object} 该图片对象
 */

picture.returnPicVM = function(srcPath, dstPath, imgbase64, len) {
	var self = this;
	self.srcPath = srcPath;
	self.dstPath = dstPath;
	self.FinishZoom = false; //是否完成压缩
	self.FinishConvert = false; //是否完成转码
	self.Base64 = imgbase64;
	self.len = len;
	//console.log(src + " " + len);
}

//利用数组记录返回的照片信息（包括路径、编码、长度）
var _returnPics = [];
//备份的回调函数
var _callback = null;

/**
 * 判断是否为数组
 * @param {Object} obj 需判断的参数
 */
isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * 生成临时文件名及路径
 * @param {int} index 标识，防止循环调用时返回相同的文件名
 * @return {String} 返回文件路径
 */
generateTempFilePath = function(index) {
	var rdm = Math.floor(Math.random() * 10000);
	var len = rdm.toString().length;
	while(len < 5) {
        rdm = "0" + rdm;
        len++;
    }
	var strIndex = index ? index : '0';
	return tempPath + (new Date()).getTime().toString() + strIndex + rdm + '.jpg';
}

/**
 * 选择本地照片，并实现压缩、转换为base64
 * @param {Boolean} crop 是否裁剪
 * @param {Boolean} multiple 是否多选
 * @param {Function} callback 回调函数
 * @return none
 */
picture.SelectPicture = function(crop, multiple, callback) {
	var self = this;
	self.pictures = new mui.PopPicker();

	//备份回调函数
	if (callback) {
		_callback = callback;
	}

	//点击空白区域或取消按钮，直接释放本弹出框
	self.pictures.mask[0].addEventListener('tap', function() {
		self.pictures.dispose();
	}, false);
	self.pictures.cancel.addEventListener('tap', function() {
		self.pictures.dispose();
	}, false);

	self.pictures.setData([{
		value: 0,
		text: '拍照'
	}, {
		value: 1,
		text: '相册中选择'
	}]);
	self.pictures.show(function(items) {
		if (items[0].value == 0) { //拍照
			var cmr = plus.camera.getCamera();
			cmr.captureImage(function(path) {
				_returnPics = [];
				plus.gallery.save(path);
				var picVM = new self.returnPicVM(path, generateTempFilePath(), '', 0);
				_returnPics.push(picVM);

				if (crop)
					self.CropImage();
				else
					self.ZoomImageToBase64();
			}, function(e) {}, {
				filename: "_doc/gallery/",
				index: 1
			});
		} else if (items[0].value == 1) { //从相册选择
			plus.gallery.pick(function(e) {
				_returnPics = [];
				if (multiple && e.files) {
					var index = 0;
					e.files.forEach(function(item) {
						var picVM = new self.returnPicVM(item, generateTempFilePath(index), '', 0);
						index++;
						_returnPics.push(picVM);
					})
					self.ZoomImageToBase64(); //选择多张时，无需裁剪
				} else {
					var picVM = new self.returnPicVM(e, generateTempFilePath(), '', 0);
					_returnPics.push(picVM);

					if (crop)
						self.CropImage();
					else
						self.ZoomImageToBase64();
				}
			}, function(e) {}, {
				filter: "image",
				multiple: multiple
			});
		}
		self.pictures.dispose();
	});
}

//cropperjs对象
picture.cropper = null;

/**
 * 确定裁剪
 * @param {String} localPath 平台绝对路径
 * @return none
 */
picture.CropConfirm = function(localPath) {
	if(_returnPics.length >= 2 || _returnPics.length <= 0) return;		//多选时不允许裁剪
	
	var self = this;
	//console.log(localPath);
	//转换cropper选中区域的对象，以符合plus.zip中压缩图片option要求
	var chosen = self.cropper.getData();
	var clip = {
		left: chosen.x,
		top: chosen.y,
		width: chosen.width,
		height: chosen.height
	}
	self.ZoomImageToBase64(clip);
	document.body.removeChild(event.srcElement.parentElement.parentElement);
}

//取消裁剪
picture.CropCancel = function() {
	document.body.removeChild(event.srcElement.parentElement.parentElement);
}

/**
 * 裁剪图片（动态生成div、img及按钮，并初始化裁剪区域）
 * @return none
 */
picture.CropImage = function() {
	if(_returnPics.length >= 2 || _returnPics.length <= 0) return;		//多选时不允许裁剪
	
	var localPath = plus.io.convertLocalFileSystemURL(_returnPics[0].srcPath);
	var self = this;
	var div = document.createElement("div"); //此处需要美化裁剪界面以及按钮样式
	div.id = 'divCropPopup';
	div.innerHTML = '<div style="position: fixed;top:0;left:0;right:0;bottom:50px;z-index: 20; background-color: lightgray; text-align: center;" class="cropper-container">\
						<img style="height: 96%; width: auto; display: initial" src="' + localPath + '" />\
					</div>\
					<div id="divButtons" style="position: fixed; bottom: 0px; height: 50px; background: #fff; width: 100%;">\
						<button id="cancel" class="mui-btn mui-btn-warning" style="margin-top: 8px; margin-left: 20px;" onclick="picture.CropCancel()">取消</button>\
						<button id="ok" class="mui-btn mui-btn-primary" style="margin-top: 8px; margin-right: 20px; float: right;" onclick="picture.CropConfirm(\'' + localPath + '\')">确定</button>\
					</div>';
	document.body.appendChild(div);

	var image = document.querySelector('.cropper-container > img');
	self.cropper = new Cropper(image, {
		aspectRatio: 1 / 1,
		autoCrop: true,
		responsive: false,
		checkImageOrigin: false,
		highlight: false,
		drapCrop: false,
		movable: false,
		rotatable: false,
		scalable: false,
		zoomable: false,
		mouseWheelZoom: false,
		doubleClickToggle: false,
		minCropBoxWidth: 50,
		minCropBoxHeight: 50
	});
}

//获取图片较大的边，参数img为页面中的IMG，返回0为宽度、1为高度
picture.GetLargerSide = function(img) {
	if (img.width >= img.height)
		return 0;
	else
		return 1;
}

/**
 * 利用plus的io，压缩图片大小，之后开始转换Base64
 * @param {Object} clip 裁剪区域的参数
 */
picture.ZoomImageToBase64 = function(clip) {
	var self = this;

	var counter = 0;
	_returnPics.forEach(function(item) {
		var option = null;
		if (clip) { //若clip不为空则裁剪，否则仅压缩
			option = {
				src: item.srcPath,
				dst: item.dstPath,
				overwrite: true,
				clip: clip
			}
		} else {
			option = {
				src: item.srcPath,
				dst: item.dstPath,
				overwrite: true,
				width: 1024 //不裁剪时，强制压缩宽度为1024
			}
		}
		plus.zip.compressImage(option,
			function() {
				//console.log("Zoom success!");
				
				item.FinishZoom = true;
				counter++;
				if (counter == _returnPics.length) { //若完成所有的压缩，则开始转码
					self.ConvertToBase64();
				}
			}, function(error) {
				console.log("Zoom error!" + error.message);
			});
	})
}

/**
 * 利用plus的文件系统API，把文件转换为Base64
 */
picture.ConvertToBase64 = function() {
	var self = this;

	var counter = 0;
	_returnPics.forEach(function(item) {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC,
			function(fs) {
				var rootEntry = fs.root;
				var reader = null;
				rootEntry.getFile(plus.io.convertLocalFileSystemURL(item.dstPath), {},
					function(entry) {
						entry.file(function(file) {
								reader = new plus.io.FileReader();
								reader.onloadend = function(e) {
									//console.log("Read success");

									item.FinishConvert = true;
									item.Base64 = e.target.result;	//返回后，显示及上传，均依赖于base64
									item.len = file.size;
									
									entry.remove();					//删除该临时文件

									counter++;
									if (counter == _returnPics.length) {
										if (_callback) {
											_callback(_returnPics);
										}
									}
								};
								reader.readAsDataURL(file);
							},
							function(e) {
								console.log(e.message);
							});
					},
					function(e){
						console.log(e.message);
					});
			});
	});
}