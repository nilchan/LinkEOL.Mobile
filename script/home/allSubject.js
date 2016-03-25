var allSubject = function() {
	var self = this;
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	
	mui.plusReady(function() {
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
	});
	
	self.gotoTeachers = function(indexS) {
		//console.log(indexS.id + '~' + indexS.subjectClass);
		var udata = {
			id: indexS.id,
			subjectClass: indexS.subjectClass
		}
		common.transfer('../../modules/teacher/teacherListHeader.html', false, {
			data: udata
		});
	}
};
ko.applyBindings(allSubject);