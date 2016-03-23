document.addEventListener( "plusready",  function()
{
    var _VIDEOPLUGIN = 'VideoUtility',
		_BRIDGE = window.plus.bridge;
    var VideoUtility = 
    {
    	/**
    	 * 测试接口
    	 * @param {String} strPara 测试参数
    	 * @return {String} json格式字符串
    	 */
    	Test : function(strPara){
			return _BRIDGE.execSync(_VIDEOPLUGIN, "Test", [strPara]);
    	},
    	
    	/**
    	 * 初始化视频播放器
    	 * @param {Object} position 播放器的位置，json数组对象[x, y, width, height]，如[0, 0, 360, 240]，单位为像素
    	 * @return {String} json格式字符串
    	 */
    	InitPlayer : function(position){
			return _BRIDGE.execSync(_VIDEOPLUGIN, "InitPlayer", [position]);
    	},
    	
    	/**
    	 * 播放视频
    	 * @param {String} vid 视频ID或本地视频文件路径
    	 * @param {Number} level 码率。1、2、3分别代表流畅、高清、超清码率
    	 * @return {String} json格式字符串
    	 */
    	PlayVideo : function(vid, level){
			return _BRIDGE.execSync(_VIDEOPLUGIN, "PlayVideo", [vid, level]);
    	},
    	
    	/**
    	 * 上传视频
    	 * @param {String} videoPath 视频绝对路径。
    	 * @param {String} title 视频标题。
    	 * @param {String} description 视频描述。
    	 * @param {Function} successCallback 成功的回调函数
    	 * @param {Function} errorCallback 失败的回调函数
    	 */
    	UploadVideo : function(videoPath, title, description, successCallback, errorCallback){
    		var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = _BRIDGE.callbackId(success, fail);

			return _BRIDGE.exec(_VIDEOPLUGIN, "UploadVideo", [callbackID, videoPath, title, description]);
    	},
    	
    	/**
    	 * 下载视频
    	 * @param {String} vid 视频ID。特指在保利威视视频云平台上对应的视频标识
    	 * @param {Number} level 码率。1、2、3分别代表流畅、高清、超清码率，默认为1
    	 * @param {Function} successCallback 成功的回调函数
    	 * @param {Function} errorCallback 失败的回调函数
    	 */
    	DownloadVideo : function(vid, level, successCallback, errorCallback){
    		var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = _BRIDGE.callbackId(success, fail);

			return _BRIDGE.exec(_VIDEOPLUGIN, "DownloadVideo", [callbackID, vid, level]);
    	},
    	
    	/**
    	 * 控制上传状态
    	 * @param {String} vid 视频ID或本地视频文件路径
    	 * @param {Number} state 状态。1、2、3分别代表开始、暂停、取消（即删除）
    	 * @return {String} json格式字符串
    	 */
    	UploadControl : function(vid, state){
			return _BRIDGE.execSync(_VIDEOPLUGIN, "UploadControl", [vid, state]);
    	},
    	
    	/**
    	 * 控制上传状态
    	 * @param {String} vid 视频ID或本地视频文件路径
    	 * @param {Number} state 状态。1、2、3分别代表开始、暂停、取消（即删除）
    	 * @return {String} json格式字符串
    	 */
    	DownloadControl : function(vid, state){
			return _BRIDGE.execSync(_VIDEOPLUGIN, "DownloadControl", [vid, state]);
    	}
    };
    window.plus.VideoUtility = VideoUtility;
}, true );