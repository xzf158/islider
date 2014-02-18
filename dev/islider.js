/**
 * @author Terry
 * @date 2013/8/29
 */
!function($) {
    "use strict";

    if($ === undefined){
        throw "need jQuery or Zepto";
        return;
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for (var i = 0, il = this.length; i < il; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
        };
    }

    var ISlider = function(element, options) {
            this.$e = $(element);
            this.options = options;
            this.currentIndex = this.options.currentIndex;
            this._prevIndex = this.currentIndex;
            this._initDom();
        };

    ISlider.prototype = {
        constructor: ISlider,
        _initDom: function() {
            if (["relative", "absolute"].indexOf(this.$e.css("position")) === -1) {
                this.$e.css("position", this.options.defaultPosition);
            }
            this.container = this.$e.find(this.options.container);
            if(this.container.length !== 1){
                throw new Error("iSlider should have only one/at least one container!")
            }

            this.container.css({
                listStyle: "none",
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                margin: 0,
                padding: 0
            });

            this._items = this.container.children('li');
            this._items.each(function(i) {
                var $this = $(this);
                $this.data("index", i);
                $this.css({
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                });
            });
            this._itemLen = this._items.length;
            this._width = this.$e.width();
            this._height = this.$e.height();

            if(this._itemLen <= 1){
                return;
            }
            this._sortItem();
            this._initEvent();
        },
        _initEvent: function() {
            var sliderInst = this,
                scope = this;
            if (this.options.prevBtn) {
                if (this.options.prevBtn === $.fn.islider.defaults.prevBtn) {
                    this._pb = this.$e.find(this.options.prevBtn);
                } else {
                    this._pb = $(this.options.prevBtn);
                }
                this._pb.on("click touchstart", function() {
                    sliderInst.prev();
                    return false;
                });
            }
            if (this.options.nextBtn) {
                if (this.options.nextBtn === $.fn.islider.defaults.nextBtn) {
                    this._nb = this.$e.find(this.options.nextBtn);
                } else {
                    this._nb = $(this.options.nextBtn);
                }
                this._nb.on("click touchstart", function() {
                    sliderInst.next();
                    return false;
                });
            }
            if (this.options.indicators) {
                if (this.options.indicators === $.fn.islider.defaults.indicators) {
                    this._ins = this.$e.children(this.options.indicators);
                } else {
                    this._ins = $(this.options.indicators);
                }
                this._indItems = this._ins.on("click touchstart seek", "li", function(e) {
                    if(scope.animating) return;
                    var $this = $(this);
                    if (e) {
                        sliderInst.seekTo($this.data("index"));
                    }
                    scope._ins.find(".active").removeClass('active');
                    $this.addClass('active');
                    return false;
                }).children("li").each(function(i) {
                    $(this).data("index", i);
                });
                this._indItems.eq(this.currentIndex).trigger('click');
            }
            var hasTouch = ("ontouchstart" in window);
            if (this._itemLen > 2 && hasTouch && this.options.touch) {
                this.$e.on("touchstart", function(e) {
                    scope._touchStart(e.originalEvent ? e.originalEvent : e);
                });
            }
        },
        _sortItem: function() {
            var _startIndex = this.currentIndex;
            var css = {};
            // if(this._itemLen <= 2){
            //     return;
            // }
            for (var i = 0, il = this._itemLen; i < il; i++) {
                if (i !== this._itemLen - 1) {
                    this._items.eq(_startIndex % this._itemLen).css({
                        left: i * 100 + "%"
                    });
                } else {
                    this._items.eq(_startIndex % this._itemLen).css({
                        left: -100 + "%"
                    });
                }
                _startIndex++;
            }
            this.container.css("left", 0);
        },
        _normalSort: function(index) {
            var css = {};
            for (var i = 0, il = this._itemLen; i < il; i++) {
                this._items.eq(i).css({
                    left: i * 100 + "%"
                });
            }

            css["left"] = (-index * this.$e.width()) + "px";
            this.container.css(css);
        },
        _touchStart: function(e) {
            this.startX = e.touches[0].pageX;
            this.startY = e.touches[0].pageY;
            this.$e.on("touchmove", onTouchMove);
            this.$e.on("touchend", onTouchEnd);
            this.cp = 0;
            var isScroll = true,
                liW = this.container.width(),
                boundW = this.options.bound ? liW * 0.25 : 0,
                lastDistanse, scope = this;
            function onTouchMove(e) {
                var touch = e.originalEvent ? e.originalEvent.touches[0]:e.touches[0];
                if (isScroll && Math.abs(touch.pageY - scope.startY) > 5) {
                    onTouchEnd();
                    return true;
                }
                if (scope.animating) {
                    return;
                }
                isScroll = false;
                lastDistanse = touch.pageX - scope.startX;
                scope.cp += lastDistanse;
                scope.container.css("left", scope.cp / liW * 100 + "%");
                scope.startX = touch.pageX;
                scope.startY = touch.pageY;
                return false;
            }

            function onTouchEnd(e) {
                scope.$e.off("touchmove", onTouchMove);
                scope.$e.off("touchend", onTouchEnd);
                if(scope.cp === 0){
                    return;
                }
                if (e) {
                    var i = Math.abs(scope.cp / liW);
                    i = i > .25 ? .25 : i;
                    i = i < .1 ? .1 : i;
                    var index = - scope.cp / liW;//(liW + scope.options.itemMargin);
                    if (Math.abs(index) > .15) {
                        index += .5 * (index  > 0 ? 1 : -1);
                        if(index > 0){
                            scope.next(i);
                        }else{
                            scope.prev(i);
                        }
                    }else{
                        $.fn.islider.animate.apply(scope, [0, .1, scope.options.easing]);
                    }
                }
            }
        },
        start: function() {
            if (typeof this.options.start == "function") {
                this.options.start.call(this, this.currentIndex, this.prevIndex, this.direction);
            }
            if (this._indItems && this._indItems.eq(this.currentIndex)) {
                this._indItems.eq(this.currentIndex).trigger('seek');
            }
            this.animating = true;
        },
        end: function() {
            this._sortItem();
            this.animating = false;
            if (typeof this.options.ended == "function") {
                this.options.ended.call(this, this.currentIndex, this.prevIndex, this.direction);
            }
        },
        prev: function(t, easing) {
            if(this._itemLen < 2){
                return;
            }
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = index + this._itemLen;
            }
            this.seekTo(index, t, easing, "prev");
        },
        next: function(t, easing) {
            if(this._itemLen < 2){
                return;
            }
            if(this._itemLen === 2){
                this._items.eq(1 - this.currentIndex).css("left", "100%");
            }
            var index = this.currentIndex + 1;
            if (index > this._itemLen - 1) {
                index = this._itemLen - index;
            }
            this.seekTo(index, t, easing, "next");
        },
        seekTo: function(index, t, easing, direction) {
            if (this.animating || index === this.currentIndex || index < 0 || index > this._itemLen - 1) {
                return;
            }
            this.prevIndex = this.currentIndex;
            var _seek;
            if (direction) {
                if (direction == "prev") {
                    _seek = 1;
                } else if (direction == "next") {
                    _seek = -1;
                }
                this.direction = direction;
            } else {
                this._normalSort(this.currentIndex);
                _seek = -index;
                if(index > this.prevIndex){
                    this.direction = "next";
                }else{
                    this.direction = "prev";
                }
            }

            this.currentIndex = index;
            this.start();
            $.fn.islider.animate.apply(this, [_seek * this.container.width(), t != undefined ? t : this.options.duration, easing ? easing : this.options.easing]);
        }
    };

    /* ISLIDER PLUGIN DEFINITION
     * ========================== */
    var old = $.fn.islider;

    $.fn.islider = function(option, completeCb) {
        return this.each(function() {
            var $this = $(this),
                options = $.extend({}, $.fn.islider.defaults, typeof option == 'object' && option);
            if (!$this._isliderInst) {
                $this._isliderInst = new ISlider(this, options);
                if (typeof completeCb === "function") {
                    completeCb.call($this._isliderInst);
                }
            }
        });
    };

    $.fn.islider.Constructor = ISlider;

    $.fn.islider.defaults = {
        currentIndex: 0,
        duration: .6,
        easing: "linear",
        touch: true,
        defaultPosition: "relative",
        start: undefined,
        ended: undefined,
        container: ".islider-container",
        indicators: ".islider-indicators",
        prevBtn: ".prev-btn",
        nextBtn: ".next-btn"
    };

    $.fn.islider.animate = function(leftValue, t, easing) {
        var scope = this,
            timeId, 
            duration = (t != undefined ? t : this.options.duration) * 1000;

        if (duration == 0) {
            this.container.css("left", leftValue);
            scope.end();
        } else {
            this.container.animate({
                left: leftValue 
            }, duration, easing != undefined ? easing : this.options.easing, function() {
                if (timeId > 0) {
                    clearTimeout(timeId);
                    scope.end();
                }
            });
            //fixed when element been hide, the end event will not fill in zepto.js 
            timeId = setTimeout(function() {
                timeId = -1;
                scope.end();
            }, duration + 1000);
        }
    };
    /* ISLIDER NO CONFLICT
     * ==================== */
    $.fn.islider.noConflict = function() {
        $.fn.islider = old;
        return this;
    };

    if(typeof window.define === 'function' && window.define.amd) {
        window.define('iSlider', [], function() {
        });
    }
}(window.jQuery || window.Zepto);