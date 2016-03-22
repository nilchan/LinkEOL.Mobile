$(function(){
	var $key=0;
	var $circle=0;
	var speed=500;
	//先做右侧点击滚动
	$("#right").click(function(){
		autoplay();
	});
	//再做左侧点击滚动
	$("#left").click(function(){
		$key--;
		if($key<0){
			$key=3;
			// 改：无缝滚动数值
			$(".box ul").css("left",-400+'%');
			
		}
		// 改：单位  100%   注意百分号是一个单位，相当于px需要带引号
		$("#box ul").stop().animate({"left":-$key*100+'%'},
		 speed);
		$circle--;
		if($circle<0){
			$circle=3;
		}
		$(".banner ol li").eq($circle).addClass('current').siblings().removeClass('current');
	});

	/*定时器*/
	var timer=setInterval(autoplay,1500);
	function autoplay(){
		$key++;
		if($key>4){
			$key=1;
			$(".box ul").css("left",0);
		}
		// 改：单位  100%   注意百分号是一个单位，相当于px需要带引号
		$("#box ul").stop().animate({"left":-$key*100+'%'},
		 speed);
		
		$circle++;
		if($circle>3){
			$circle=0;
		}
		$(".banner ol li").eq($circle).addClass('current').siblings().removeClass('current');
	}

	/*清除和开启定时器*/
	$("#box").hover(function() {
		clearInterval(timer);
	}, function() {
		clearInterval(timer);
		timer=setInterval(autoplay,1500);
	});
	
	 $(".banner ol li").click(function()
	  {
		  $key=$(this).index();
		  $circle=$(this).index();
		  $(".banner ul").stop().animate({"left":-$key*100+'%'},300);
		  $(".banner ol li").eq($circle).addClass('current').siblings().removeClass('current');	 
     });

	// 这里是我们写的，添加背景色
	var colors=['#050214','#000','#43a3f9','#000','#050214']

	$('.banner ul li').each(function(index, el) {
		$(el).css({ 'background-color':colors[index]  });
	});


});




/*作品库*/


$(function() {
			var speed=500;
			var offsetX=20-$(".box").offset().left; 
            var offsetY=20-$(".box").offset().top; 
			$(".box").find('.pic_li').hover(function() {
					$(".pic_li").stop().fadeTo(speed,0.6);
					$(this).stop().fadeTo(speed,1);
					/*$(this).children('img').stop().animate({"width":"10px"}, speed); 
					$(this).children('img').stop().animate({"width":"400px"}, speed);*/
					$(this).children('img').addClass(hover);
					
			
			}, function() {
				$(".pic_li").stop().fadeTo(speed,1);
				/*$(this).children('img').stop().animate({"marginLeft":"0"}, speed);
				$(this).children('img').stop().animate({"width":"351px"}, speed);*/
				$(this).children('img').removeClass(hover);
			});
		});
		

/*合作机构*/		

$(function() {
			var speed=500;
			$(".Cooperation-content div").fadeTo(0,0.5);
			$(".Cooperation-content p").each(function(index, el) {
				var num=-index*25;
				$(el).css("background-position","10px "+num+"px");
			});

			$(".Cooperation-content li").hover(function() {
				$(this).children('p,div').stop().animate({"bottom":"0"}, speed)
			}, function() {
				$(".Cooperation-content li").children('p,div').stop().animate({"bottom":"-35px"}, speed)
			});
		});
		
/*师资介绍*/

/*$(".demo>li").mouseover(function(event) {
				$(this).children('ul').show();
			});

			$(".demo>li").mouseout(function(event) {
				$(this).children('ul').hide();
			});*/

$(function(){
	$(".demo>li").mouseover(function(event) {
				$(this).children('.curr').show();
			});

		$(".demo>li").mouseout(function(event) {
				$(this).children('.curr').hide();
			});
			
});


/*$(function(){
	$(".header-in ul>li").mouseover(function(event) {
				$(this).children('.cut').show();
			});

		$(".header-in ul>li").mouseout(function(event) {
				$(this).children('.cut').hide();
			});		
});
*/

$(function() {
	$(".header-in ul>li").hover(function() {
		$(this).children('.cut').stop().animate({width:80}, 600);
	}, function() {
		$(this).children('.cut').stop().animate({width:0}, 200);
	});
});

$(function(){
	$(".header-in ul>li").click(function(event) {
	        	$(this).siblings().children('em').removeClass('em');
				$(this).children('em').addClass('em');
				
			});

			
});


 $(window).scroll(function () {
        var sT = $(window).scrollTop();
        if (sT > 40) {
            $(".t-top").addClass("headFixed");
			$(".logo>h1>a").attr({"background":"url(../images/logo-B.png)"});
			$('.top').hide();
			$('.cut').css("bottom","-3px");
			$('.header').css({"background":"#C30D23"});
			$('.header-in ul li a span').css('color','#fff');
			$('.header-in ul li a i').css('color','#fff');
			$('.cut').css('background','#ffc600');
			
        } else {
            $(".t-top").removeClass("headFixed");
			$(".logo>h1>l_hover").show();
			$('.top').show();
			$('.cut').css("bottom",0);
			$(".logo>h1>a").attr({"background":"url(../images/logo.png)"});
			$('.header').css("background","#000");
			$('.logo').css('background','#C30D23');
			$('.header-in ul li a span').css('color','#fff');
			$('.header-in ul li a i').css('color','#fff');
			$('.cut').css('background','#C30D23');
			
        }

    });
