var LessonBaseInfo = function() {
	var self = this;
	//self.times = ko.observableArray(['请选择课时']);
	//self.showTimes = ko.observableArray(['请选择课时']);
	self.teacherName = ko.observable('袁怡航');
	self.teacherID = ko.observable(0);
	self.teacherPhoto = ko.observable('../../images/my-default.png');
	self.courses = ko.observableArray([]); //老师课程列表
	self.selectedCourse = ko.observable(); //当前选中的课程
	self.ageRange = ko.computed(function() { //当前选择课程的年龄范围
		var ret = '';
		if (self.selectedCourse()) {
			var ageMin = self.selectedCourse().AgeMin;
			var ageMax = self.selectedCourse().AgeMax;
			if (ageMin > 0 && ageMax > 0) {
				ret = ageMin + '~' + ageMax + '岁';
			} else if (ageMax > 0) {
				ret = '不大于' + ageMax + '岁';
			} else if (ageMin > 0) {
				ret = '不小于' + ageMin + '岁';
			} else {
				ret = '不限';
			}

			ret = '建议年龄范围：' + ret;
		}

		return ret;
	})
	self.selectedLocation = ko.observable(); //当前选择的授课方式
	self.locations = ko.computed(function() { //当前选择课程的所有授课方式
		var ret = ko.observableArray([]);
		if (self.selectedCourse()) {
			if (self.selectedCourse().LocationJson) {
				var arr = JSON.parse(self.selectedCourse().LocationJson);
				if (arr) {
					var selected = true;
					arr.forEach(function(item) {
						var obj = {
							LocationType: item.LocationType,
							LocationName: item.LocationName,
							Cost: item.Cost,
							Selected: ko.observable(selected) //初始化时勾选第一个
						}
						if (selected) {
							self.selectedLocation(obj);
							selected = false;
						}

						ret().push(obj);
					})
				}
			}
		}

		return ret();
	})

	//选择课程
	self.chooseCourse = function() {
		mui.plusReady(function() {
			self.ppCourses.show(function(items) {
				self.courses().forEach(function(item) {
					if (item.ID == items[0].value) {
						self.selectedCourse(item);
						return;
					}
				})
			});
		});
	}

	//选择授课方式
	self.selectLocation = function(data) {
		if (data.Selected() == false) {
			data.Selected(true);
			self.locations().forEach(function(item) {
				if (item.Selected() == true) {
					item.Selected(false);
					return;
				}
			})
			data.Selected(true);
		}

		//设置选择的授课方式
		self.selectedLocation(data);
	}
	
	/**
	 * 为显示订单的约课信息而获取数据
	 * @param {Int} courseToUserID 约课ID
	 */
	self.getDataForOrder = function(courseToUserID){
		self.ViewOrder(true);	//标记由我的订单跳转而来
		
		var ajaxUrl = common.gServerUrl + 'API/CourseToUser/'+courseToUserID;
		mui.ajax(ajaxUrl,{
			type: 'GET',
			success: function(responseText) {
				//console.log(JSON.stringify(responseText));
				var data = JSON.parse(responseText);
				
				//初始化基本信息
				self.teacherID(data.TeacherID);
				if(data.TeacherPhoto){
					self.teacherPhoto(common.getPhotoUrl(data.TeacherPhoto));
				}
				self.teacherName(data.TeacherName);
				
				var lessons = JSON.parse(data.LessonJson);
				var obj;
				if(lessons && lessons.length > 0){
					//获取第一个，用于初始化授课方式及费用
					var first = lessons[0];
					var obj = {
						LocationType: 0,
						LocationName: first.LocationName,
						Cost: first.Cost,
						Selected: true
					};
					
					//循环获取，初始化课时时间
					lessons.forEach(function(item){
						self.ChosenTimes.push(item.BeginTime);
					})
				}
				
				//初始化课程信息
				self.selectedCourse({
					CourseName: data.CourseName,
					AgeMin: data.AgeMin,
					AgeMax: data.AgeMax,
					Introduce: data.Introduce,
					LocationJson: '[' + JSON.stringify(obj) + ']'	//只有一个元素，加上[]便可
				});
				
				//self.locations
			}
		});
	}

	var ppCourses;
	//获取参数
	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值

		//从订单跳转过来
		if (typeof(web.order) != "undefined") {
			self.Order(web.order);
			getDataForOrder(self.Order().TargetID);
		} else {
			if (typeof(web.userID) !== "undefined") {
				self.teacherID(web.userID);
			}
			if (typeof(web.teacherPhoto) !== "undefined") {
				self.teacherPhoto(web.teacherPhoto);
			}
			if (typeof(web.teacherName) !== "undefined") {
				self.teacherName(web.teacherName);
			}
			if (typeof(web.courses) !== "undefined") {
				self.courses(web.courses);

				self.ppCourses = new mui.PopPicker();
				self.ppCourses.setData(common.JsonConvert(self.courses(), 'ID', 'CourseName'));
			}
		}
	});
};

//ko.applyBindings(LessonBaseInfo, document.getElementById('divLessonInfo'));