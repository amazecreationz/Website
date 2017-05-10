$(document).ready(function() {
	var body = $(".body-container");
	var navbar = $('nav');
	$(window).resize(function() {
		var height = $(window).height() - $("nav").height();
		$(".body-container").css({'height': height});
		$(".full-container").css({'height': height});
	});
	$(window).resize();
    body.scroll(function() {
		var scrollTop = body.scrollTop();
		if(scrollTop > 50){
			navbar.removeClass('no-shadow');
		}
		else {
			navbar.addClass('no-shadow');
		}
	});
});
