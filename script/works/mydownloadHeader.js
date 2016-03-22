mui.plusReady(function() {
	var topPx = '48px';
	if (plus.os.vendor == 'Apple') {
		topPx = '63px';
	}

	mui.init({
		subpages: [{
			url: "mydownload.html",
			id: "mydownload.html",
			styles: {
				top: topPx,
				bottom: '0px',
			}
		}]
	});
});

	mui.back = function() {
		common.showIndexWebview(4);
	};