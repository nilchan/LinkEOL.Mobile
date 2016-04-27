var viewModel = function() {
	var self = this;

	self.courses = ko.observableArray([]);
	self.classtimes = ko.observableArray([]);
	self.active = ko.observable(true);
	
	self.getCourse = function() {
		mui.ajax(common.gServerUrl + "API/Course/GetAllCourseByUserID?userId=" + getLocalItem("UserID"), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.courses(result);
				//console.log(responseText);
				common.showCurrentWebview();
			},
			error: function(){
				common.showCurrentWebview();
			}
		});
	};

	self.submitEnabled = function(item) {
		mui.ajax(common.gServerUrl + "API/Course/" + item.ID, {
			type: 'PUT',
			data: {
				IsEnabled: item.IsEnabled,
				UserID: item.UserID
			},
			success: function(responseText) {
				self.courses.remove(item);
				self.courses.push(item);
				self.courses.sort(function(left, right) {
					return left.ID == right.ID ? 0 : (left.ID < right.ID ? -1 : 1);
				});

				var tips = item.IsEnabled ? "已启用" : "已停用";
				mui.toast(tips);
			}
		});
	}

	self.setEnabled = function(data) {
		if (!data.IsEnabled) {
			data.IsEnabled = true;
			submitEnabled(data);
		}
	};

	self.setDisabled = function(data) {
		if (data.IsEnabled) {
			data.IsEnabled = false;
			submitEnabled(data);
		}
	};

	self.removeCourse = function() {
		var course = this;
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Course/" + course.ID, {
					type: 'DELETE',
					success: function(responseText) {
						self.courses.remove(course);
						mui.toast("删除成功");
					}
				});
			}
		});
	}
	window.addEventListener('refreshCourses', function(event) {
		self.courses().forEach(function(item) {
			if (item.ID == event.detail.courseId) {
				var tmp = common.clone(item);
				tmp.CourseName = event.detail.CourseName;
				tmp.SubjectName = event.detail.SubjectName;
				tmp.CourseType = event.detail.CourseType;
				tmp.Introduce = event.detail.Introduce;
				tmp.MaxStudent = event.detail.MaxStudent;
				tmp.BeginTime = event.detail.BeginTime;
				tmp.LessonCount = event.detail.LessonCount;
				tmp.ClasstimeJson = event.detail.ClasstimeJson;
				tmp.StudentJson = event.detail.StudentJson;
				tmp.SubjectID = event.detail.SubjectID;
				//console.log(typeof tmp);
				self.courses.replace(item, tmp);
				console.log('课程列表刷新');
				//console.log(JSON.stringify(self.courses()));
			}
		});
	});
	
	window.addEventListener('refreshCourseList', function(event) {
		
		if (event.detail.course!="" && typeof event.detail.course!="undefined") {
			self.courses(self.courses().concat(event.detail.course));
		}
	});
	
	self.gotoEditCourse = function() {
		common.transfer("../../modules/course/addCourse.html", true, {
			course: this
		});
	};

	self.gotoRegistered = function() {
		common.transfer("../../modules/course/registeredList.html", true, {
			course: this
		});
	};

	self.gotoAddCourse = function() {
		common.transfer("../../modules/course/addCourse.html", true);
	};

	self.gotoTime = function() {
		common.transfer("../../modules/course/availableTime.html", true);
	};
	
	mui.init({
		beforeback: function() {
			var myCourse = plus.webview.currentWebview().opener();
			if (myCourse.id == "modules/course/myCourse.html") {
				mui.fire(myCourse, 'refreshCourse', {
				});
			}
			return true
		}
	});
	
	mui.plusReady(function(){
		self.getCourse();
	});
};
ko.applyBindings(viewModel);