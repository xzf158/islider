###A simple html5 slider, Base on jQuqey/Zepto.
- Support loop
- User can easy custom animate function.
- Support jQuery and Zepto
- Support touch screen.
 
####How used:

```
var picIslider;
$("#pic-islider").islider({
    currentIndex: 0,
    duration: .6,
    // easing: "ease-in",
    touch: true,
    defaultPosition: "relative",
    start: undefined,
    ended: undefined,
    container: ".isilder-container",
    indicators: ".isilder-indicators li",
    prevBtn: ".prev-btn",
    nextBtn: ".next-btn"
},function(){
    picIslider = this;
});
```

####How to custome animate function:
Just overwrite $.fn.islider.animate function.

```
$.fn.islider.animate = function(leftValue, t,  easing) {
    var scope = this;
    scope.container.css("transition", "");
    setTimeout(function(){
        move(scope.container).set("left", leftValue).duration(t*1000).ease(easing).end(function(){
            scope.container.css("transition", "none");
            setTimeout(function(){
                scope.end(); 
            }, 50);
        });
    }, 50);
};
```

####Api List:
#####Seek to the index of item  
- seekTo(index, t, easing, [direction])
	- index: the index of slide item.
	- t: animate time, 0 will has no animate.
	- easing: easing, need to pay attention to what animate function you used.
	- direction: optional, only can fill in "pref" and "next"

#####Show previous item
- prev(t, easing)
	- t: animate time, 0 will has no animate.
	- easing: easing, need to pay attention to what animate function you used.

#####Show next item	
- next(t, easing)
	- t: animate time, 0 will has no animate.
	- easing: easing, need to pay attention to what animate function you used.
	