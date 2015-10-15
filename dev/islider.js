/**
 * @author Terry
 * @date 2013/8/29
 * @modified 2015/10/01
 */
! function($) {
	"use strict";

	var requestAnimFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 16.7);
			};
	})();

	var $document = $(document);

	var ua = window.navigator.userAgent.toLowerCase(),
		isAndroid = ua.match(/android/i) !== null,
		touchEndMaxDuration = isAndroid ? .4 : .25;

	if ($ === undefined) {
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
		if (window.jQuery && this.options.easing) {
			if (!jQuery.easing[this.options.easing]) {
				if (window.console && window.console.warn) {
					console.warn("Not support easing: " + this.options.easing);
				}
				delete this.options.easing;
			}
		}
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
			if (this.container.length !== 1) {
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

			this._items = this.container.children(this.options.children);
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

			if (this._itemLen <= 1) {
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
					this._ins = this.$e.find(this.options.indicators);
					this._ins.each(function(i) {
						$(this).data("index", i);
					});
				} else {
					this._ins = $(this.options.indicators).each(function(i) {
						$(this).data("index", i);
					});
				}
				this._indItems = this._ins.on("click touchstart seek", function(e) {
					if (scope.animating) return;
					var $this = $(this);
					if (e) {
						sliderInst.seekTo($this.data("index"));
					}
					scope._ins.removeClass('active');
					$this.addClass('active');
					return false;
				});
				this._indItems.eq(this.currentIndex).trigger('click');
			}
			// var hasTouch = ("ontouchstart" in window);
			if (this.options.touch) {
				this.$e.on("mousedown touchstart", function(e) {
					if (e.button == 2) return false;
					scope._dragStart(e);
				});
			}
		},
		_sortItem: function() {
			var _startIndex = this.currentIndex;
			var css = {};
			for (var i = 0, il = this._itemLen; i < il; i++) {
				if (il <= 2) {
					if (this.currentIndex == 0) {
						this._items.eq(i).css({
							left: i * 100 + "%"
						});
					} else {
						this._items.eq(i).css({
							left: (i - 1) * 100 + "%"
						});
					}
				} else {
					if (i !== this._itemLen - 1) {
						this._items.eq(_startIndex % this._itemLen).css({
							left: i * 100 + "%"
						});
					} else {
						this._items.eq(_startIndex % this._itemLen).css({
							left: -100 + "%"
						});
					}
				}
				_startIndex++;
			}
			this.container.css("left", 0);
			// if(this._itemLen <= 2){
			//     this._sortItem = function (){
			//         // console.log("============1");
			//     };
			//     console.log("============",this._sortItem );
			// }
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
		//when only have two items, need this function
		//to make sure the items's order correct.
		_forceSort: function(value) {
			var scope = this;
			if (value > 0) {
				if (scope.currentIndex == 0) {
					scope._items.eq(0).css({
						left: "0%"
					});
					scope._items.eq(1).css({
						left: "-100%"
					});
				} else {
					scope._items.eq(0).css({
						left: "-100%"
					});
					scope._items.eq(1).css({
						left: "0%"
					});
				}
			} else if (value < 0) {
				if (scope.currentIndex == 0) {
					scope._items.eq(0).css({
						left: "0%"
					});
					scope._items.eq(1).css({
						left: "100%"
					});
				} else {
					scope._items.eq(0).css({
						left: "100%"
					});
					scope._items.eq(1).css({
						left: "0%"
					});
				}
			}
		},
		_dragStart: function(e) {
			if (this.animating || this.updating) return false;
			this._prevCp = 0;
			this.startX = e.originalEvent ? (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.originalEvent.pageX) : (e.touches ? e.touches[0].pageX : e.pageX);
			this.startY = e.originalEvent ? (e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.originalEvent.pageY) : (e.touches ? e.touches[0].pageY : e.pageY);
			$document.on("mousemove touchmove", onDragMove)
				.on("mouseup mouseleave touchend", onDragEnd);
			this.cp = 0;
			var isScroll = true,
				liW = this.container.width(),
				boundW = this.options.bound ? liW * 0.25 : 0,
				lastDistanse, scope = this,
				timeid;
			scope.updating = true;
			update();

			function onDragMove(e) {
				var originalEvent = e.originalEvent ? (e.originalEvent.touches ? e.originalEvent.touches[0] : e.originalEvent) : (e.touches ? e.touches[0] : e);
				if (isScroll && Math.abs(originalEvent.pageY - scope.startY) > 5) {
					onDragEnd();
					return true;
				}
				if (scope.animating) {
					return false;
				}
				isScroll = false;
				lastDistanse = originalEvent.pageX - scope.startX;
				scope.cp += lastDistanse;

				scope.startX = originalEvent.pageX;
				scope.startY = originalEvent.pageY;
				// e.originalEvent.preventDefault();
				// e.originalEvent.stopPropagation();
				return false;
			}

			function update() {
				if (!scope.updating) return;
				if (scope._prevCp != scope.cp) {
					if (!scope.options.loop) {
						if ((scope.cp < 0 && scope.currentIndex == scope._itemLen - 1) || (scope.cp > 0 && scope.currentIndex == 0)) {
							scope._prevCp = scope.cp = 0;
							requestAnimFrame(update);
							return;
						}
					}
					if (scope._itemLen == 2) {
						scope._forceSort(scope._prevCp);
					}
					scope.container.css("left", scope.cp);
					scope._prevCp = scope.cp;
				}
				requestAnimFrame(update);
			}

			function onDragEnd(e) {
				$document.off("mousemove touchmove", onDragMove)
					.off("mouseup mouseleave touchend", onDragEnd);
				scope.updating = false;
				// scope.animating = false;
				if (scope.cp === 0) {
					return;
				}
				if (e) {
					var i = Math.abs(scope.cp / liW);
					i = i > touchEndMaxDuration ? touchEndMaxDuration : i;
					i = i < .1 ? .1 : i;
					var index = -scope.cp / liW; //(liW + scope.options.itemMargin);
					if (Math.abs(index) > .15) {
						index += .5 * (index > 0 ? 1 : -1);
						if (index > 0) {
							scope.next(i);
						} else {
							scope.prev(i);
						}
					} else {
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
			this.updating = false;
			if (typeof this.options.ended == "function") {
				this.options.ended.call(this, this.currentIndex, this.prevIndex, this.direction);
			}
		},
		prev: function(t, easing) {
			if (this._itemLen < 2 || this.animating) {
				return false;
			}
			var index = this.currentIndex - 1;
			if (index < 0) {
				if (!this.options.loop) {
					return;
				}
				index = index + this._itemLen;
			}
			this.seekTo(index, t, easing, "prev");
		},
		next: function(t, easing) {
			if (this._itemLen < 2 || this.animating) {
				return false;
			}
			if (this._itemLen === 2) {
				this._items.eq(1 - this.currentIndex).css("left", "100%");
			}
			var index = this.currentIndex + 1;
			if (index > this._itemLen - 1) {
				if (!this.options.loop) {
					return;
				}
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
				if (this._itemLen == 2) {
					this._forceSort(_seek);
				}
			} else {
				this._normalSort(this.currentIndex);
				_seek = -index;
				if (index > this.prevIndex) {
					this.direction = "next";
				} else {
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
		loop: true,
		defaultPosition: "relative",
		start: undefined,
		ended: undefined,
		container: ".islider-container",
		children: "li",
		indicators: ".islider-indicators li",
		prevBtn: ".prev-btn",
		nextBtn: ".next-btn"
	};

	$.fn.islider.animate = function(leftValue, t, easing) {
		var scope = this,
			timeId,
			duration = (t != undefined ? t : this.options.duration) * 1000;

		// alert(duration+ " " + easing);
		// duration = 600;
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

	if (typeof window.define === 'function' && window.define.amd) {
		window.define('iSlider', [], function() {});
	}
}(window.jQuery || window.Zepto);