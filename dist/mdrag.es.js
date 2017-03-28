var defaultOptions = {
  revertOnFail: true
};
var isTouch = ('ontouchstart' in window) || ('DocumentTouch' in window && document instanceof DocumentTouch);

function mdrag (options) {
  options = options || {};
  for (var i in defaultOptions) {
    if (!(i in options)) { options[i] = defaultOptions[i]; }
  }
  if ('touch' in options) { isTouch = options.touch; }
	var larg = 'larg' in options ? options.larg : false;
  var downE = isTouch ? 'touchstart' : 'mousedown';
  var moveE = isTouch ? 'touchmove' : 'mousemove';
  var upE = isTouch ? 'touchend' : 'mouseup';
  var dragRoot = {};
  var counter = 0;

  function getDownFunc (name) {
    return function downHandle (evt) {
      var e = /touch/.test(evt.type) ? evt.touches[0] : evt;
      var data = dragRoot[name];
      if (!data) { return }
      data.target = this;
      data.ox = e.ox || e.pageX;
      data.oy = e.oy || e.pageY;
      if (data.state.onstart && data.state.onstart.call(this, evt, data, dragRoot) === false) { return }
      data.type = evt.type;
    }
  }

  function moveHandle (evt) {
    var e = /touch/.test(evt.type) ? evt.touches[0] : evt;
    var isDown = false;
    for (var name in dragRoot) {
      var data = dragRoot[name];
      if (!data.type) { continue }
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

  function upHandle (evt) {
    for (var name in dragRoot) {
      var data = dragRoot[name];
      if (!data.type) { continue }
      data.up && data.up(evt, data, dragRoot);
      data.type = null;
      data.dx = data.dy = 0;
    }
  }
  document.addEventListener(moveE, moveHandle, larg);
  document.addEventListener(upE, upHandle, larg);

  function dragHandler (data, moveCB, endCB) {
    if (arguments.length === 0) { return dragRoot }
		if (typeof data == 'function') { endCB = moveCB, moveCB = data, data = {}; }
    var name = data.name = data.name || '$' + counter++;
    if (dragRoot[name]) {
      dragRoot[name].destroy();
    }
    var startCB = getDownFunc(name);
    var context = {
      name: name,
      state: data || {},
      start: startCB,
      move: moveCB,
      end: endCB
    };

    // auto bind down event if have data.el
    var el = data.el;
    if (el) {
      el.addEventListener(downE, startCB, larg);
      el.mdrag = context;
    }
		context.destroy = function () {
			if (el) { el.removeEventListener(downE, startCB, larg); }
			dragRoot[name] = null;
			// console.log(name, el, dragRoot[name])
		};
    dragRoot[name] = context;
    return startCB
  }
  dragHandler.destroyAll = function () {
    dragRoot = {};
    document.removeEventListener(moveE, moveHandle, larg);
    document.removeEventListener(upE, upHandle, larg);
  };
  return dragHandler
}

export default mdrag;
