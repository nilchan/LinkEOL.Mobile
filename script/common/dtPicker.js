var dtPicker = dtPicker || {};

dtPicker._fill = function(num) {
	num = num.toString();
	if (num.length < 2) {
		num = 0 + num;
	}
	return num;
}

/*
 * 弹出日期选择框
 * 
 * optionsJson:	设置Json，包括以下内容
 * 		type:			类型：'datetime'/'date'/'time'/'month'/'hour'
 * 		beginYear:		起始年
 * 		endYear:		结束年
 * 		beginHour:		起始小时
 * 		endHour:		结束小时
 * initValue:	初始值
 * callback:	回调函数
 */
dtPicker.PopupDtPicker = function(optionsJson, initValue, callback){
	var self = this;
	//var obj = event.srcElement;
	//var optionsJson = obj.getAttribute('data-options') || '{}';
	var options = optionsJson;	//JSON.parse(optionsJson);
	if(!options.type){
		options.type = 'datetime';
	}
	/*if(beginYear){
		options.beginYear = beginYear;
	}
	if(endYear){
		options.endYear = endYear;
	}*/
	var beginHour = options.beginHour ? options.beginHour : 0;
	var endHour = options.endHour ? options.endHour : 23;
	
	var hArray = [];
	for (var h = beginHour; h <= endHour; h++) {
		var val = self._fill(h);
		hArray.push({
			text: val,
			value: val
		});
	}
	if(!options.customData){
		options.customData = {}
	}
	if(!options.customData.h){
		options.customData.h = []
	}
	options.customData.h = hArray;
	
	if(!isNaN(newDate(initValue))){
		options.value = initValue;
	}
	else{
		var secondDay = newDate();
		secondDay.setDate(secondDay.getDate() + 1);
		var hour = secondDay.getHours();
		if(hour < 8 || hour > 21){
			hour = '08';
		}
		var defaultDate = (2000 + secondDay.getYear() % 100) + '-' + (secondDay.getMonth() + 1) + 
			'-' + secondDay.getDate() + ' ' + hour + ':00:00';

		options.value = defaultDate;
	}
	
	options.value = newDate(options.value).format('yyyy-MM-dd hh:mm:ss');
	/*
	 * 首次显示时实例化组件
	 * 示例为了简洁，将 options 放在了按钮的 dom 上
	 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
	 */
	var picker = new mui.DtPicker(options);
	picker.show(function(rs) {
		/*
		 * rs.value 拼合后的 value
		 * rs.text 拼合后的 text
		 * rs.y 年，可以通过 rs.y.value 和 rs.y.text 获取值和文本
		 * rs.m 月，用法同年
		 * rs.d 日，用法同年
		 * rs.h 时，用法同年
		 * rs.i 分（minutes 的第二个字母），用法同年
		 */
		//返回完整日期字符串
		callback(rs.y.text + '-' + rs.m.text + '-' + rs.d.text + ' ' + rs.h.text + ':' + rs.i.value + ':00');
		
		/* 
		 * 返回 false 可以阻止选择框的关闭
		 * return false;
		 */
		/*
		 * 释放组件资源，释放后将将不能再操作组件
		 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
		 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
		 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
		 */
		picker.dispose();
	});
}
