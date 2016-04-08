var examScore = function() {
    var self = this;
    var aid, uid;

    self.scores = ko.observableArray([]);

    self.getExamScore = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfo?ActivityID=' + aid +'&UserID=' + uid;
        mui.ajax(url, {
            type: 'GET',
            success: function(result) {
                console.log(result);
                self.scores(JSON.parse(result));
            }
        });

    };

    aid = common.getQueryStringByName('aid');
    uid = common.getQueryStringByName('uid');

    self.getExamScore();

};

ko.applyBindings(examScore);