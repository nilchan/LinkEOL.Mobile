var addWorks = function() {
	var self = this;

	var ppSubject, ppWorkType, ppPublic, ppTeacher;
	var teacherID, subjectID, activityID, publicID = 1;
	var userType = getLocalItem("UserType");
	var resumeObj, videoFile, uploadFinished = false,
		workID;
	var isback = false;
	var TYPE, ID;
	var isNullPPTeacher=true;
	self.pageTitle = ko.observable('作品');
	self.teacherText = ko.observable("请选择授课老师");
	self.subjectText = ko.observable("请选择科目");
	self.workTypeID = ko.observable(0);
	self.workTypeText = ko.observable("请选择类型");
	self.titleText = ko.observable('');
	self.contentText = ko.observable('');
	self.filePath = ko.observable(''); //视频文件路径
	self.fileName = ko.observable(''); //视频文件名称
	self.publicText = ko.observable('是');
	self.videoSelected = ko.observable(false);
	self.uploadPercetage = ko.observable(0);
	self.uploading = ko.observable(false);
	self.isstop = ko.observable(false);


	// 监听从前台切换到后台事件
	document.addEventListener("pause", function() {
		isback = true;
	}, false);
	// 监听从后台切换回前台事件
	document.addEventListener("resume", function() {
		isback = false;
	}, false);

	self.initResumeJS = function() {
		var incompatible = true;
		try {
			var tmp = new Blob()
		} catch (e) {
			incompatible = false;
		}

		var chunksize = 1 * 1024 * 1024;
		if (!incompatible) {
			chunksize = 1000 * 1024 * 1024; //不兼容的，设置每帧1000M（相当于不切片）
		}

		resumeObj = new Resumable({
			target: common.gVideoServerUrl + 'API/Video/Upload',
			maxFiles: 1,
			chunkSize: chunksize,
			simultaneousUploads: 1, //单线程
			forceChunkSize: true, //每帧大小不能超过设定大小
			maxChunkRetries: 10, //重试10次（0或负数则无限次）
			headers: {
				'Authorization': getAuth()
			},
			fileType: ['.mp4', '.mov', '']
		});

		resumeObj.assignBrowse(document.getElementById('browseButton'));
		//resumeObj.assignBrowse(document.getElementById('browseButton1'));
		resumeObj.on('fileAdded', function(file, event) {
			self.videoSelected(true);
			videoFile = file.file;
			var urlObj = window.webkitURL || window.URL;
			var url = urlObj.createObjectURL(videoFile);
			//document.getElementById('videoObj').src = url;
			var videoPos = document.getElementById('videoPos');
			videoPos.innerHTML = '<div class="video-js-box"><video controls width="168px" height="105px" class="video-js" data-setup="{}"><source src="' + url + '" /></video></div>'
			VideoJS.setupAllWhenReady();

			//console.log(file.uniqueIdentifier);	//size+'-'+fileName(no dot)
			//console.log(file.fileName+" "+file.relativePath) 
			//console.log(JSON.stringify(file.file));	//HTML5 File object
		});
		resumeObj.on('progress', function() {
			self.uploadPercetage(resumeObj.progress() * 100);
		});
		resumeObj.on('complete', function() {
			//console.debug('isUploading: '+videoFile.isUploading());
			if (!uploadFinished) { //人为取消则不触发
				if (!isback) {
					uploadFinished = true;
					if (typeof(activityID) !== "undefined") {
						common.transfer("/modules/activity/activityEnrollSuccess.html", true, {
							aid: activityID
						});
					} else {
						mui.toast('上传完成，跳转至作品列表页');
						common.transfer("worksListMyHeader.html", true, {
							workTypeID: self.workTypeID(),
							workTitle: userType == common.gDictUserType.teacher ? '我的作品' : self.workTypeText()
						}, false, false);
					}
				} else {
					var btnArray = ['确认'];
					if (typeof(activityID) !== "undefined") {
						mui.confirm('点击确定跳转至完成页', '上传成功', btnArray, function(e) {
							if (e.index == 0) {
								uploadFinished = true;
								common.transfer("/modules/activity/activityEnrollSuccess.html", true, {
									aid: activityID
								});
							}
						});
					} else {
						mui.confirm('点击确定跳转至作品页', '上传成功', btnArray, function(e) {
							if (e.index == 0) {
								uploadFinished = true;
								mui.toast('上传完成，跳转至作品列表页');
								common.transfer("worksListMyHeader.html", true, {
									workTypeID: self.workTypeID(),
									workTitle: userType == common.gDictUserType.teacher ? '我的作品' : self.workTypeText()
								}, false, false);
							}
						});
					}
				}
			}
		});
		resumeObj.on('error', function(message, file) {
			//mui.toast('上传过程出现错误，')
			//console.debug('error: ' + message + "###" + file.isUploading());
		});
		resumeObj.on('fileRetry', function(message) {
			//console.debug('fileRetry: ' + message + "###" + file.isUploading());
		});
	}

	self.startUpload = function(workId, attachId, attachPath) {
		var t = resumeObj.opts.target;
		if (t.indexOf('?') < 0) {
			t += '?';
		} else {
			t += '&';
		}
		t += 'workId=' + workId + '&attachId=' + attachId + '&attachPath=' + attachPath;
		resumeObj.opts.target = t;
		resumeObj.upload();
	}



	//老师选择
	self.setTeacher = function() {
		if (isNullPPTeacher) {
			plus.nativeUI.alert("还没有授课老师，快去选择吧", function() {
				common.transfer('../teacher/teacherListHeader.html',true,{},false,true);
			}, "提示", "确定");
			return ;
		}
		//console.log(ppTeacher.getSelectedItems()[0].text);
		ppTeacher.show(function(items) {
			self.teacherText(items[0].text);
			teacherID = items[0].value;
			setLocalItem("localTeacherText", items[0].text);
			setLocalItem("localTeacherID", items[0].value);
		});
	};

	//科目选择
	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.subjectText(items[1].text);
			subjectID = items[1].value;
			setLocalItem("localSubjectText", items[1].text);
			setLocalItem("localSubjectID", items[1].value);
		});
	};

	//类型选择
	self.setWorkType = function() {
		ppWorkType.show(function(items) {
			self.workTypeText(items[0].text);
			self.workTypeID(items[0].value);
			setLocalItem("localWorkTypeText", items[0].text);
			setLocalItem("localWorkTypeID", items[0].value);
		});
	};

	//是与否选择
	self.setPublicType = function() {
		ppPublic.show(function(items) {
			self.publicText(items[0].text);
			publicID = items[0].value;
		});
	};

	//添加本地视频
	self.addFile = function(uploadType) {
		videoPicker.SelectVideo(uploadType, false, function(value) {
			if (value) {
				self.filePath(value[0].srcPath);
				self.fileName(value[0].fileName);

				var videoPos = document.getElementById('videoPos');
				videoPos.innerHTML = '<div class="video-js-box"><video controls width="168px" height="105px" class="video-js" data-setup="{}"><source src="' + value[0].srcPath + '" /></video></div>'
				VideoJS.setupAllWhenReady();
			}
		});
	}

	/**
	 * 生成临时文件名及路径
	 * @param {int} index 标识，防止循环调用时返回相同的文件名
	 * @return {String} 返回文件路径
	 */
	self.generateTempFilePath = function(index) {
		var rdm = Math.floor(Math.random() * 10000);
		var len = rdm.toString().length;
		while (len < 5) {
			rdm = "0" + rdm;
			len++;
		}
		var strIndex = index ? index : '0';
		return (new Date()).getTime().toString() + strIndex + rdm;
	}

	//上传
	self.upload = function() {
		if (self.titleText() == "") {
			mui.toast('请填写曲目名称');
			return;
		}

		//上传学生作业时，必须选择老师
		if ((userType == common.gDictUserType.student && self.workTypeID() == 105) && (!teacherID || teacherID <= 0)) {
			mui.toast('请选择老师');
			return;
		}

		//上传非学生作业时，必须选择科目
		if ((userType == common.gDictUserType.student && self.workTypeID() == 104 || userType == common.gDictUserType.teacher) && (typeof subjectID == "undefined" || !subjectID || subjectID <= 0)) {
			mui.toast('请选择科目');
			return;
		}
		if (self.workTypeID() <= 0) {
			mui.toast('请选择类型');
			return;
		}
		/*if (self.contentText() == "") {
			mui.toast('请完善描述');
			return;
		}*/
		if (self.videoSelected() == false) {
			mui.toast('请选择作品');
			return;
		}

		var arrTmp = videoFile.name.split('.');
		var ext = arrTmp.length > 1 ? '.' + arrTmp[arrTmp.length - 1] : "";
		var randomFilename = self.generateTempFilePath() + ext;

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();


		TYPE = common.gDictWorkSourceType.Teacher;
		ID = teacherID;

		if (typeof(activityID) !== "undefined") {
			TYPE = common.gDictWorkSourceType.Activity;
			ID = activityID;
		}

		mui.ajax(common.gServerUrl + "Common/Work", {
			type: "POST",
			data: {
				AuthorID: getLocalItem("UserID"),
				Title: self.titleText(),
				SubjectID: subjectID,
				WorkSrcType: TYPE,
				WorkSrcID: ID,
				ContentText: self.contentText(),
				WorkType: self.workTypeID(),
				IsPublic: publicID == 1 ? true : false,
				Video: self.generateTempFilePath() + ext
			},
			success: function(responseText) {
				if (responseText) {
					mui.toast("已保存，准备开始上传");
					self.uploading(true);
					var obj = JSON.parse(responseText);
					workID = obj.ID;

					self.startUpload(obj.ID, obj.AttachID, obj.AttachPath);
					plus.nativeUI.closeWaiting();

					/*plus.storage.removeItem(common.gVarLocalUploadTask);
					//保存至本地缓存
					var oldTasks = plus.storage.getItem(common.gVarLocalUploadTask);
					var arr = JSON.parse(oldTasks) || [];
					arr.push({
						workid: obj.ID,
						worktype: self.workTypeID(),
						videofile: videoSelected
					});
					plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(arr));
					console.log(JSON.stringify(arr));*/
				}
			},
			error: function() {
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		});
	};

	self.stopTheUpload = function() {
		self.isstop(true);
		resumeObj.pause();
	}

	self.startTheUpload = function() {
		self.isstop(false);
		resumeObj.upload();
	}

	self.cancelTheUpload = function() {
		var btnArray = ['确认', '取消'];
		self.stopTheUpload();
		mui.confirm('确认取消上传？', '取消提示', btnArray, function(e) {
			if (e.index == 0) {
				if (workID > 0) {
					mui.ajax(common.gServerUrl + 'Common/Work/' + workID, {
						type: 'DELETE',
						success: function(responseText) {
							mui.toast('成功取消了本次上传');
							self.videoSelected(false);
							self.uploading(false);
							uploadFinished = true;
							videoFile = null;
							resumeObj.cancel();
							old_back();
						},
						error: function() {
							self.videoSelected(false);
							self.uploading(false);
							uploadFinished = true;
							videoFile = null;
							resumeObj.cancel();
							old_back();
						}
					});
				} else {
					self.startTheUpload();
				}
			} else {
				self.startTheUpload();
			}
		});
	}

	//返回按钮
	var old_back = mui.back;
	mui.back = function() {
		if (!uploadFinished && videoFile) {
			var btnArray = ['确认', '取消'];
			self.stopTheUpload();
			mui.confirm('确认取消上传？', '关闭提示', btnArray, function(e) {
				if (e.index == 0) {
					if (workID > 0) {
						mui.ajax(common.gServerUrl + 'Common/Work/' + workID, {
							type: 'DELETE',
							success: function(responseText) {
								mui.toast('成功取消了本次上传');
								console.log('成功取消了本次上传');
								self.videoSelected(false);
								self.uploading(false);
								uploadFinished = true;
								videoFile = null;
								resumeObj.cancel();

								old_back();
							},
							error: function() {
								//console.log("error");
								self.videoSelected(false);
								self.uploading(false);
								uploadFinished = true;
								videoFile = null;
								resumeObj.cancel();

								old_back();
							}
						});
					} else {
						old_back();
					}
				} else {
					self.startTheUpload();
				}
			});
		} else {
			old_back();
		}
	}

	mui.plusReady(function() {
		self.initResumeJS();

		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			activityID = web.aid;
		}

		ppSubject = new mui.PopPicker({
			layer: 2
		});
		ppWorkType = new mui.PopPicker();
		ppWorkType.setData(common.gJsonWorkTypeTeacher);

		ppSubject.setData(common.getAllSubjectsBoth());
		ppPublic = new mui.PopPicker();
		ppPublic.setData(common.gJsonYesorNoType);

		var workIndex = plus.webview.currentWebview();

		//初始化老师弹窗及选择（只有作业模块需要）
		ppTeacher = new mui.PopPicker();
		if (userType == common.gDictUserType.student) {
			var ajaxUrl = common.gServerUrl + 'API/Action?userid=' + getLocalItem('UserID') + '&targetType=' + common.gDictActionTargetType.User + '&userType=' + common.gDictUserType.teacher + '&page=1&pageSize=9999';
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					var myTeachers = JSON.parse(responseText);
					if (myTeachers.length > 0) {
						isNullPPTeacher=false;
						ppTeacher.setData(common.JsonConvert(myTeachers, 'ID', 'DisplayName'));
						if (!(workIndex.teacherID && workIndex.workTypeID == 105)) {
							self.teacherText(myTeachers[0].DisplayName);
							teacherID = myTeachers[0].ID;
						}
					}
				}
			});
			var localTeacherID = getLocalItem("localTeacherID");
			var localTeacherText = getLocalItem("localTeacherText");
			if (localTeacherID && localTeacherText) {
				teacherID = localTeacherID;
				self.teacherText(localTeacherText);
			}
		}

		//初始化科目选择
		var localSubjectID = getLocalItem("localSubjectID");
		var localSubjectText = getLocalItem("localSubjectText");
		if (localSubjectID && localSubjectText) {
			subjectID = localSubjectID;
			self.subjectText(localSubjectText);
		}

		if (workIndex.workTypeID && userType == common.gDictUserType.student) {
			self.workTypeID(workIndex.workTypeID);
			if (workIndex.workTypeID == 104) {
				//self.titleText(getLocalItem('DisplayName') + "的作品(" + newDate().format('yyyyMMdd') + ')');
				//self.contentText(self.titleText());
				self.workTypeText("我的作品");
			} else if (workIndex.workTypeID == 105) {
				//self.titleText(getLocalItem('DisplayName') + "的作业(" + newDate().format('yyyyMMdd') + ')');
				/*if (workIndex.contentText) {
					self.contentText(workIndex.contentText);
				} else {
					self.contentText(self.titleText());
				}*/
				if (workIndex.teacherID) {
					teacherID = workIndex.teacherID;
					self.teacherText(workIndex.teacherName);
					setLocalItem("localTeacherText", self.teacherText());
					setLocalItem("localTeacherID", teacherID);
				}

				self.workTypeText("我的作业");
				self.pageTitle('作业');
			}
		} else {
			//初始化类型选择
			var localWorkTypeID = getLocalItem("localWorkTypeID");
			var localWorkTypeText = getLocalItem("localWorkTypeText");
			if (localWorkTypeID && localWorkTypeText) {
				self.workTypeID(localWorkTypeID);
				self.workTypeText(localWorkTypeText);
			} else {
				self.workTypeID(common.gJsonWorkTypeTeacher[0].value);
				self.workTypeText(common.gJsonWorkTypeTeacher[0].text);
			}
			//self.titleText(getLocalItem('DisplayName') + "的作品(" + newDate().format('yyyyMMdd') + ')');
			//self.contentText();
		}

		common.showCurrentWebview();
	});
}
ko.applyBindings(addWorks);