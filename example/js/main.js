$(function() {
	// move.select = function(selector){
	//     return selector[0];
	// };
	//custome sanimate
	// $.fn.islider.animate = function(leftValue, t,  easing) {
	//     var scope = this;
	//     scope.container.css("transition", "");
	//     setTimeout(function(){
	//         move(scope.container).set("left", leftValue).duration(t*1000).ease(easing).end(function(){
	//             scope.container.css("transition", "none");
	//             setTimeout(function(){
	//                 scope.end(); 
	//             }, 50);
	//         });
	//     }, 50);
	// };
	var picIslider;
	$("#pic-islider").islider({
		currentIndex: 0,
		duration: .6,
		easing: "ease-in",
		touch: true,
		defaultPosition: "relative",
		start: undefined,
		ended: undefined,
		container: ".islider-container",
		indicators: ".islider-indicators li",
		prevBtn: ".prev-btn",
		nextBtn: ".next-btn"
	}, function() {
		picIslider = this;
	});
	// picIslider.seekTo(2, 0);
});