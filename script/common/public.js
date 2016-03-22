// JavaScript Document

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



$(function() {
	$(".techer-in ul>li").hover(function() {
		$(this).children('div').addClass('t_current');
		$(this).siblings().children('div').removeClass('t_current');
	}, function() {
		$(this).children('div').removeClass('t_current');
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
