mui.plusReady(function() {
	var topPx = '48px';
	if (plus.os.vendor == 'Apple') {
		topPx = '63px';
	}

	mui.init({
		subpages: [{
			url: "myUpload.html",
			id: "myUpload.html",
			styles: {
				top: topPx,
				bottom: '0px',
			}
		}]
	});
});

mui.back = function() {
	common.transfer('worksListMyHeader.html', true, {}, false, false);
};