var addIndstructStudent = function() {
	var self = this;

	self.attentionList = ko.observableArray([]); //关注我的学生
	self.instructStudent = ko.observable(''); //选中的学生 
	self.subjectID = ko.observable('');
	var all = document.getElementById('checkId');
	var userId = getLocalItem('UserID');

	self.getAttentionList = function() {
		var ajaxUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId=" + getLocalItem("UserID") + "&userType=" + common.gDictUserType.student;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				self.attentionList(responseText);

			}
		})
	}

	self.addIndstructStudent = function(data) {  //http://192.168.1.99:8090/API/TeacherToStudent/TeacherToStudentAdd?TeacherID=1125&StudentID=1125&SubjectID=16&Type=2
		console.log(JSON.stringify(data));
		var ajaxUrl = common.gServerUrl + '/API/TeacherToStudent/TeacherToStudentAdd?TeacherID=' + userId + '&StudentID=' + data.userID + '&SubjectID='+data.SubjectID+"&Type="+common.gInstructType[1].value;
		mui.ajax(ajaxUrl,{
			type:'POST',
			success:function(){
				
			}
		})
	}


}
ko.observable(addIndstructStudent);