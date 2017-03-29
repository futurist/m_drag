var defaultOptions = {
  revertOnFail: true,
  larg: false,
  touch: ('ontouchstart' in window) || ('DocumentTouch' in window && document instanceof DocumentTouch)
};

function mdrag (options) {
  options = options || {};
  for (var i in defaultOptions) {
    if (!(i in options)) { options[i] = defaultOptions[i]; }
  }
  var isTouch = options.touch;
  var larg = options.larg;
  // var larg = 'larg' in options ? options.larg : false
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
      var onstart = data.config.onstart;
      if (onstart && onstart.call(
          this, evt, data, dragRoot
        ) === false) { return }
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
      var move = data.config.onmove;
      if (move && move(evt, data, dragRoot) === false) {
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
      var end = data.config.onend;
      end && end(evt, data, dragRoot);
      data.type = null;
      data.dx = data.dy = 0;
    }
  }
  document.addEventListener(moveE, moveHandle, larg);
  document.addEventListener(upE, upHandle, larg);

  function dragHandler (config) {
    if (arguments.length === 0) { return dragRoot }
    config = config || {};
    var name = config.name || '$' + counter++;
    if (dragRoot[name]) {
      dragRoot[name].destroy();
    }
    var startCB = getDownFunc(name);
    var context = {
      name: name,
      config: config,
      start: startCB
    };

    // auto bind down event if have data.el
    var el = config.el;
    var prevTouchAction;
    if (el) {
      prevTouchAction = el.style.touchAction;
      if (isTouch) { el.style.touchAction = config.touchAction || 'none'; }
      el.addEventListener(downE, startCB, larg);
      el.mdrag = context;
    }
    context.destroy = function () {
      if (el) {
        if (isTouch) { el.style.touchAction = prevTouchAction; }
        el.removeEventListener(downE, startCB, larg);
      }
      delete dragRoot[name];
      context.destroyed = true;
    // console.log(name, el, dragRoot[name])
    };
    startCB.mdrag = dragRoot[name] = context;
    return startCB
  }
  dragHandler.destroyAll = function () {
    for (var name in dragRoot) {
      dragRoot[name].destroy();
    }
    document.removeEventListener(moveE, moveHandle, larg);
    document.removeEventListener(upE, upHandle, larg);
  };
  dragHandler.options = options;
  return dragHandler
}

export default mdrag;
