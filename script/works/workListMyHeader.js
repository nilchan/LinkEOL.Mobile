var worksHeader = function() {
	var self = this;
	var workTypeID;
	self.workTitle = ko.observable('');
	self.seachValue = ko.observable('');
	mui.init();
	var workIndex;

	mui.plusReady(function() {
		workIndex = plus.webview.currentWebview();
		//console.log(workIndex);
		if (getLocalItem('UserType') == common.gDictUserType.student) {
			self.workTitle('我的作业');
		} else {
			self.workTitle('我的作品');
		}
		removeLocalItem("teacherID"); //清空该键值的内容
		if (typeof workIndex.ID != "undefined" && workIndex.ID > 0) { //ID代表作者UserID
			ID = workIndex.ID;
			setLocalItem("teacherID", ID);
		}
		var topPx = '48px';
		if (plus.os.vendor == 'Apple') {
			topPx = '63px';
		}
		var pageMy = plus.webview.create("worksListMyWorks.html", "worksListMyWorks.html", {
			top: topPx,
			bottom: '0px',
		})
		workIndex.append(pageMy);
	});

	self.goUploads = function() { //我的上传
		//common.transfer('../works/myUploadHeader.html', true);
		common.transferToMyUpload();
	}

	//返回按钮
	var old_back = mui.back;
	mui.back = function() {
		//console.log(JSON.stringify(workIndex.opener()))
		var myupload=plus.webview.getWebviewById('myUpload');//获取我的上传页面webview
//		console.log(JSON.stringify(myupload.opener()));
		if (workIndex.opener()) {
			if (workIndex.opener().id == 'modules/my/my.html' || workIndex.opener().id =='messageListID') {
				old_back();
			} else if(myupload && myupload.opener().id == '../works/worksListMyHeader.html'){
				common.showIndexWebview(4);
			}else{
				common.showIndexWebview(3);
			}
		}else{
			common.showIndexWebview(3);
		}

	}
}
ko.applyBindings(worksHeader);