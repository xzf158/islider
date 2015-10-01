###一个简单的滑动库，基于jQuery/Zepto
- 支持循环
- 用户可自定义动画方法
- 支持jQuery和Zepto
- 支持桌面和触摸屏

 
####怎么使用:
######html部分:
```
<div id="pic-islider">
    <ul class="islider-container">
        <li><img src="images/pic-1.jpg"/></li>
        <li><img src="images/pic-2.jpg"/></li>
        <li><img src="images/pic-3.jpg"/></li>
        <li><img src="images/pic-4.jpg"/></li>
        <li><img src="images/pic-5.jpg"/></li>
    </ul>
    <div id="prev" class="prev-btn">&lt;</div>
    <div id="next" class="next-btn">&gt;</div>
    <ul class="islider-indicators">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
</div>
```

######Js部分：
```
var picIslider;
$("#pic-islider").islider({
    currentIndex: 0, //初始化后，默认显示的index
    duration: .6, //动画时长
    easing: "ease-in", //缓动，要注意Zepto的缓动和jQuery的是不一样的. ease-in只支持Zepto
    touch: true, //是否支持滑动效果，默认为true支持滑动
    loop: true, //是否支持循环效果，默认为true支持循环
    defaultPosition: "relative", //指定父级容器的定位方式，所默认为relative
    start: undefined, //开始切换的调用的function
    ended: undefined, //切换结束后调用的function
    container: ".isilder-container", //元素的容器
    indicators: ".isilder-indicators li", //指示器的容器
    prevBtn: ".prev-btn", //上一个按钮，若不在container容器内，需要写完整的选择器路径
    nextBtn: ".next-btn" //下一个按钮，若不在container容器内，需要写完整的选择器路径
},function(){
    picIslider = this; //slider对象
});
```

####怎么自定义动画方式:
直接重写 $.fn.islider.animate 方法.

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

####Api 列表:
#####跳到指定index的元素 
- seekTo(index, t, easing, [direction])
	- index: 元素的index.
	- t: 动画时间，0表示无动画.
	- easing: 缓动，要注意Zepto的缓动和jQuery的是不一样的.
	- direction: 备用，只能使用"pref" 和 "next"

#####显示上一个
- prev(t, easing)
	- t: 动画时间，0表示无动画.
	- easing: 缓动，要注意Zepto的缓动和jQuery的是不一样的.

#####显示下一个	
- next(t, easing)
	- t: 动画时间，0表示无动画.
	- easing: 缓动，要注意Zepto的缓动和jQuery的是不一样的.


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
    loop: true,
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
	