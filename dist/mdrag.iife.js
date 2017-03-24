var mdrag = (function () {
'use strict';

var defaultOptions = {
	revertOnFail: true
};
var isTouch = ('ontouchstart' in window) || ('DocumentTouch' in window && document instanceof DocumentTouch);

function mdrag(options) {
	options = options || {};
	for (var i in defaultOptions) {
		if (!(i in options)) { options[i] = defaultOptions[i]; }
	}
	if ('touch' in options) { isTouch = options.touch; }
	// var downE = isTouch? 'touchstart' :'mousedown'
	var moveE = isTouch ? 'touchmove' : 'mousemove';
	var upE = isTouch ? 'touchend' : 'mouseup';
	var dragRoot = {};

	function getDownFunc(name) {
		return function downHandle(evt) {
			var e = /touch/.test(evt.type) ? evt.touches[0] : evt;
			var data = dragRoot[name];
			if (!data) { return }
			data.target = this;
			data.ox = e.ox || e.pageX;
			data.oy = e.oy || e.pageY;
			if (data.user.onmousedown && data.user.onmousedown.call(this, evt, data, dragRoot) === false) { return; }
			data.type = evt.type;
		}
	}

	function moveHandle(evt) {
		var e = /touch/.test(evt.type) ? evt.touches[0] : evt;
		var isDown = false;
		for (var name in dragRoot) {
			var data = dragRoot[name];
			if (!data.type) { continue; }
			isDown = true;
			var stack = [data.pageX, data.pageY, data.dx, data.dy];
			data.pageX = e.pageX;
			data.pageY = e.pageY;
			data.dx = data.ox - e.pageX;
			data.dy = data.oy - e.pageY;
			if (data.move && data.move(evt, data, dragRoot) === false) {
				if (options.revertOnFail) {
					data.dy = stack.pop();
					data.dx = stack.pop();
					data.pageY = stack.pop();
					data.pageX = stack.pop();
				}
				return upHandle(evt)
			}
		}
		if (isDown) { evt.preventDefault(); }
	}

	function upHandle(evt) {
		for (var name in dragRoot) {
			var data = dragRoot[name];
			if (!data.type) { continue; }
			data.up && data.up(evt, data, dragRoot);
			data.type = null;
			data.dx = data.dy = 0;
		}
	}
	document.addEventListener(moveE, moveHandle);
	document.addEventListener(upE, upHandle);

	function dragHandler(name, data, moveCB, upCB) {
		if (arguments.length === 0) { return dragRoot; }
		if (arguments.length === 1) { return dragRoot[name]; }
		if (typeof data == 'function') { upCB = moveCB, moveCB = data, data = {}; }
		delete dragRoot[name];
		dragRoot[name] = {
			name: name,
			user: data || {},
			move: moveCB,
			up: upCB
		};
		return getDownFunc(name)
	}
	dragHandler.destroy = function () {
		dragRoot = {};
		document.removeEventListener(moveE, moveHandle);
		document.removeEventListener(upE, upHandle);
	};
	return dragHandler
}

return mdrag;

}());
