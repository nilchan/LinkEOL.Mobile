var addWorks = function() {
	var self = this;

	self.subjectText = ko.observable("请选择科目");
	self.workTypeID = ko.observable(0);
	self.workTypeText = ko.observable("请选择类型");
	self.titleText = ko.observable('');
	self.contentText = ko.observable('');
	self.filePath = ko.observable(''); //视频文件路径
	self.fileName = ko.observable(''); //视频文件名称
	self.publicText = ko.observable('是');
	self.userType = ko.observable(getLocalItem("UserType"));
	self.videoSelected = ko.observable(false);
	var ppSubject, ppWorkType, ppPublic;
	var subjectID, publicID = 1;

	mui.plusReady(function() {
		//console.log(self.userType() == common.gDictUserType.student);
		ppSubject = new mui.PopPicker({
			layer: 2
		});
		ppWorkType = new mui.PopPicker();
		ppWorkType.setData(common.gJsonWorkTypeTeacher);

		ppSubject.setData(common.getAllSubjectsBoth());
		ppPublic = new mui.PopPicker();
		ppPublic.setData(common.gJsonYesorNoType);

		var workIndex = plus.webview.currentWebview();

		//初始化科目选择
		var localSubjectID = getLocalItem("localSubjectID");
		var localSubjectText = getLocalItem("localSubjectText");
		if (localSubjectID && localSubjectText) {
			subjectID = localSubjectID;
			self.subjectText(localSubjectText);
		}
		
		

		if (self.userType() == common.gDictUserType.student) {
			self.workTypeID(common.gJsonWorkTypeStudent[0].value);
			self.workTypeText(common.gJsonWorkTypeStudent[0].text);
		} else {
			//初始化类型选择
			var teacherSubjectID=getLocalItem("SubjectID");
			if(teacherSubjectID){
				subjectID =teacherSubjectID;
			}
			var localWorkTypeID = getLocalItem("localWorkTypeID");
			var localWorkTypeText = getLocalItem("localWorkTypeText");
			if (localWorkTypeID && localWorkTypeText) {
				self.workTypeID(localWorkTypeID);
				self.workTypeText(localWorkTypeText);
			} else {
				self.workTypeID(common.gJsonWorkTypeTeacher[2].value);		//老师作品类型，默认选择“演出作品”
				self.workTypeText(common.gJsonWorkTypeTeacher[2].text);
			}
		}

		common.showCurrentWebview();
	});

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
	self.addFile = function() {
		videoPicker.SelectVideo(false, function(value) {
			if (value) {
				self.filePath(value[0].srcPath);
				self.fileName(value[0].fileName);
				self.videoSelected(true);
				alert('after pick:' + value[0].srcPath);
				
				var videoPos = document.getElementById('videoPos');
				videoPos.innerHTML = '<div class="video-js-box"><video controls width="168px" height="105px" class="video-js" data-setup="{}"><source src="' + value[0].srcPath + '" /></video></div>';
				VideoJS.setupAllWhenReady();
			}
			else{
				self.filePath('');
				self.fileName('');
				self.videoSelected(false);
			}
		});
	}	

	//上传
	self.upload = function() {
		if (self.titleText() == "") {
			mui.toast('请填写曲目名称');
			return;
		}

		//学生上传视频时，必须选择科目
		if (self.userType() == common.gDictUserType.student && subjectID <= 0) {
			mui.toast('请选择科目');
			return;
		}
		if (self.workTypeID() <= 0) {
			mui.toast('请选择类型');
			return;
		}
		if (self.filePath() == "") {
			mui.toast('请选择视频');
			return;
		}

		var arrTmp = self.filePath().split('.');
		var ext = arrTmp[arrTmp.length - 1];

		var evt = event;
		if (!common.setDisabled()) return;

		mui.ajax(common.gServerUrl + "Common/Work", {
			type: "POST",
			data: {
				AuthorID: getLocalItem("UserID"),
				Title: self.titleText(),
				SubjectID: subjectID,
				ContentText: self.contentText(),
				WorkType: self.workTypeID(),
				IsPublic: publicID == 1 ? true : false,
				Video: self.fileName() + '.' + ext
			},
			success: function(responseText) {
				if (responseText) {
					mui.toast("已保存，等待上传完成");
					var obj = JSON.parse(responseText);

					//保存至本地缓存
					var oldTasks = plus.storage.getItem(common.gVarLocalUploadTask);
					var arr = JSON.parse(oldTasks) || [];
					arr.push({
						workId: obj.ID,
						videoPath: self.filePath(),
						videoServerType: obj.VideoServerType,
						uploadInfoJson: obj.UploadInfoJson
					});
					plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(arr));
					console.log(JSON.stringify(arr));
					common.transfer("myUploadHeader.html", true, {}, false, false);
				}
			},
			error: function() {
				common.setEnabled(evt);
			}
		});
	};
}
ko.applyBindings(addWorks);