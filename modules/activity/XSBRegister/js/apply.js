var applay = function() {
    var self = this;

    var aid = 0;


    self.areaID = ko.observable(1);
    self.sexID = ko.observable(0);
    self.testStyleID = ko.observable(1);
    self.testGroupID = ko.observable(1);

    self.areaText = ko.observable('广州');
    self.sexText = ko.observable('男');
    self.testStyleText = ko.observable('个人节目');
    self.testGroupText = ko.observable('少儿A组(6-9)');
    self.title = ko.observable('');
    self.userName = ko.observable('');
    self.testWork = ko.observable('');
    self.school = ko.observable('');
    self.phone = ko.observable('');
    self.parentPhone = ko.observable('');
    self.teacher = ko.observable('');
    self.teacherPhone = ko.observable('');
    self.wechat = ko.observable('');
    self.train = ko.observable('');
    self.introduce = ko.observable('');
    
    //选择
    self.selectArea = function() {
        self.area.show(function(items) {
            self.areaText(items[0].text);
            self.areaID(items[0].value);
        });
    };

    self.selectSex = function() {
        self.sex.show(function(items) {
            self.sexText(items[0].text);
            self.sexID(items[0].value);
        });
    };

    self.selectTestStyle = function() {
        self.testStyle.show(function(items) {
            self.testStyleText(items[0].text);
            self.testStyleID(items[0].value);
        });
    };

    self.selectTestGroup = function() {
        self.testGroup.show(function(items) {
            self.testGroupText(items[0].text);
            self.testGroupID(items[0].value);
        });
    };

    //获取
    self.getTest = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfoByActivityID?ActivityID=';
        url = url + aid;
        mui.ajax(url,{
            type: 'GET',
            success: function(result) {
                var obj = JSON.parse(result);
                self.title(obj.Title);
                var tmp = obj.CommentNameJSON.replace(/Id/g, 'value').replace(/CommentName/g, 'text');
                self.area.setData(JSON.parse(tmp));
            }
        });
    };

    //验证
    var validate = function(val, text) {
        if( val === "" ) {
            mui.toast(text + '不能为空~');
            return false;
        }
        return true;
    };

    //提交
    self.submitFrom = function() {
        if( !validate(self.userName(), '姓名') ) return ;
        if( !validate(self.testWork(), '参赛作品') ) return ;
        if( !validate(self.phone(), '报名手机号码') ) return ;
        if( !validate(self.teacher(), '指导老师') ) return ;
        if( !validate(self.teacherPhone(), '指导老师电话') ) return ;

        var evt = event;
		if(!common.setDisabled()) return;

        var url = common.gServerUrl + 'Common/RegGame/RegGameAdd';
        var data = {
            CommentName: self.areaText(),
            Gender: self.sexID(),
            GroupType: self.testStyleID(),
            GroupDivision: self.testGroupID(),
            UserName: self.userName(),
            WorkTitle: self.testWork(),
            UserPhone: self.phone(),
            TeacherName: self.teacher(),
            TeacherPhone: self.teacherPhone(),
            Training: self.train(),
            Resume:self.introduce(),
            ActivityID: aid
        };

        mui.ajax(url, {
            type: 'POST',
            data: data,
            success: function() {
                mui.alert('请在个人中心->通知列表查看已有报名', '报名成功', function() {
                    mui.back();
                });
                common.setEnabled(evt);
            },
            error: function(){
            	common.setEnabled(evt);
            }
        });
    };

    //初始化
    mui.ready(function(){
        self.sex = new mui.PopPicker();
        self.area = new mui.PopPicker();
        self.testStyle = new mui.PopPicker();
        self.testGroup = new mui.PopPicker();

        self.sex.setData(common.gJsonGenderType);
        self.testStyle.setData(common.gActivityGameStyle);
        self.testGroup.setData(common.gActivityGameGroup);
        aid = common.getQueryStringByName('aid');
        uphone = common.getQueryStringByName('uname');
        if(common.StrIsNull(uphone) != ''){
        	self.phone(uphone);
        	document.getElementById('tbPhone').disabled = true;
        }

        self.getTest();
    });
};

ko.applyBindings(applay);