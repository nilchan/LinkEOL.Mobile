var registeredList = function() {
	var self = this;

	self.studentList = ko.observableArray([]); 	//管理报名者数组列表
	self.regList = ko.observableArray([]);		//已报名学生列表
	self.dispList = ko.observableArray([]);		//显示的列表
	self.initList = ko.observableArray([]);		//初始化的学生列表（传入参数所得）
	self.selectOnly = ko.observable(false);		//仅在此页面选择（不保存）
	self.selectedStudents = ko.observable('');	//所选学生的ID串
	var all = document.getElementById('checkId');
	var course;
	var saved = false;
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.course) !== "undefined") {
			course = web.course;
		}
		if(course == "undefined") return;
		if(common.StrIsNull(course.StudentJson) != '')
			self.initList(JSON.parse(course.StudentJson));

		if(web.selectOnly)
			self.selectOnly(true);
		
		//获取关注我的学生列表
		var ajaxUrl = common.gServerUrl + "API/TeacherToStudent/TeacherToStudentList?TeacherID=" + getLocalItem("UserID");
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var list = JSON.parse(responseText);
				self.studentList(list);
		
				//获取已报名的学生列表
				var ajaxUrl = common.gServerUrl + "API/CourseToUser/GetListByCourseID?courseID=" + course.ID;
				mui.ajax(ajaxUrl, {
					type: 'GET',
					success: function(responseText) {
						var list2 = JSON.parse(responseText);
						self.regList(list2);
						
						var studentListLen=self.studentList().length;
						var regListLen=self.regList().length
						//两者均有返回
						if(studentListLen > 0 || regListLen > 0){
							for(var j = studentListLen - 1; j >= 0; j--){
								var student = self.studentList()[j];
								
								//从数据库读取的已报名学生列表
								for(var i = regListLen - 1; i >= 0; i--){
									var reg = self.regList()[i];
									var isSelected = false;		//判断传入参数列表中是否有这个学生，没有则不需要选中
									for(var k = self.initList().length - 1; k >= 0; k--){
										if(self.initList()[k] == reg.ID){
											isSelected = true;
											break;
										}
									}

									if(student.ID == reg.ID){
										var obj = {
											ID: student.ID,
											Photo: student.Photo,
											DisplayName: student.DisplayName,
											Gender: student.Gender,
											TheAge: student.TheAge,
											Province: student.Province,
											City: student.City,
											District: student.District,
											Checked: ko.observable(isSelected)
										};
										self.dispList.push(obj);
										
										//剔除
										self.regList.remove(reg);
										self.studentList.remove(student);
										self.initList.remove(reg.ID);
									}
								}
							}
							
							//还有未列出的关注我的学生
							if(self.studentList().length > 0){
								self.studentList().forEach(function(student){
									var isSelect = false;
									self.initList().forEach(function(init){
										if(init == student.ID){
											isSelect = true;
										}
									});
									var obj = {
										ID: student.ID,
										Photo: student.Photo,
										DisplayName: student.DisplayName,
										Gender: student.Gender,
										TheAge: student.TheAge,
										Province: student.Province,
										City: student.City,
										District: student.District,
										Checked: ko.observable(isSelect)
									};
									self.dispList.push(obj);
								})
							}
							
							//还有未列出的已报名学生
							if(self.regList().length > 0){
								self.regList().forEach(function(reg){
									var obj = {
										ID: reg.ID,
										Photo: reg.Photo,
										DisplayName: reg.DisplayName,
										Gender: reg.Gender,
										TheAge: reg.TheAge,
										Province: reg.Province,
										City: reg.City,
										District: reg.District,
										Checked: ko.observable(true)
									};
									self.dispList.push(obj);
								})
							}
						}
					}
				})
			}
		})
	})

	self.checkAll = function(){
		var status = all.checked;

		self.dispList().forEach(function(item){
			item.Checked(!status);
		})
	}

	//获取选中的学生UserID串（逗号隔开）
	self.getValues = function(){
		var ret = '';
		self.dispList().forEach(function(item){
			if(item.Checked()){
				if(ret == ''){
					ret = item.ID.toString();
				}
				else{
					ret += ','+item.ID.toString();
				}
			}
		})
		
		return ret;
	}

	self.ensure = function() {
		var IDs = self.getValues();
		/*if(IDs == ''){
			mui.toast('请选择至少一个学生');
			return;
		}*/
		
		//判断是否超过最大人数
		if(IDs.indexOf(',') >= 0 && IDs.split(',').length > course.MaxStudent && course.MaxStudent > 0){
			mui.toast('所选人数已超过课程最大学生数（'+course.MaxStudent+'人）');
			return;
		}
		
		self.selectedStudents('['+IDs+']');
		if(self.selectOnly()){
			saved = true;
			mui.back();
		}
		else{
			var ajaxUrl = common.gServerUrl + "API/CourseToUser/ImportCourseToUser?courseId=" + course.ID + "&studentIDs="+IDs;
			plus.nativeUI.showWaiting();
			mui.ajax(ajaxUrl, {
				type: 'POST',
				success: function(responseText) {
					saved = true;
					mui.toast("保存成功");
					mui.back();
					plus.nativeUI.closeWaiting();
				},
				error: function(responseText){
					plus.nativeUI.closeWaiting();
				}
			})
		}
	}
	
	mui.init({
		beforeback: function() {
			if(!saved) return;
			
			var workParent = plus.webview.currentWebview().opener();
			if (workParent != null) {
				if (self.selectOnly()) {
					mui.fire(workParent, 'refreshStudentCount', {
						StudentJson: self.selectedStudents()
					});
					return true;
				}
				else{
					//console.log(self.selectedStudents());
					mui.fire(workParent, 'refreshCourses', {
						courseId: course.ID,
						CourseName: course.CourseName,
						SubjectName: course.SubjectName,
						CourseType: course.CourseType,
						Introduce: course.Introduce,
						MaxStudent: course.MaxStudent,
						BeginTime: course.BeginTime,
						LessonCount: course.LessonCount,
						ClasstimeJson: course.ClasstimeJson,
						StudentJson: self.selectedStudents(),
						SubjectID: course.SubjectID
					});
					return true;
				}
			}
		}
	});

}
ko.applyBindings(registeredList);