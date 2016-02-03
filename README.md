# m_drag

**no dependancy, minimum but strong drag lib for both dom and virtual dom support**

# Install

- `NodeJS`:

````bash
npm install -S m_drag
````

- `Browser`:

1. download `dist/m_drag.js` file into your folder

2. included `m_drag.js` in your html, **no dependancy**

````html
<script type="text/javascript" src="js/m_drag.js"></script>
````

# Usage

### use with DOM

````javascript
// create any div, or exists...
var clip = document.createElement('div')
clip.style.cssText = "position:absolute; z-index:999; border:1px dotted red"
document.body.appendChild(clip)

var clipDrag = m_drag({});	// param can be empty or some options {...}

document.body.onmousedown = 
clipDrag(
	'clip',	// a name for the dragInstance
	function(e, data){ 	// when mouse move
		clip.style.left = data.ox + 'px'
		clip.style.top = data.oy + 'px'
		clip.style.width = -data.dx + 'px'
		clip.style.height = -data.dy + 'px'
	},
	function(e, data){	// when mouse up
		console.log('drag complete..')
	}	
)

````

This way you can do any thing using javascript, like boundary check, etc.

### use with V-DOM(e.g. mithril)

````javascript

m('div.draggable', 
	{onmousedown: 
		clipDrag(
			'clip2', 
			{ onmousedown:function(){ m.redraw.strategy('none') } }, // hook down event, prevent mithril auto-redraw system
			function(evt, data){  /*do some thing with mousemove...*/ },		// when move
			function(evt, data){  /*do some thing with mouseup...*/ }		// when up
		)
	}
)

````

# API

## m_drag([options]) => downHandler

**create drag root factory, return a function that can be handler for mousedown etc.**

**options** is js object, can be following key:

- `revertOnFail`: boolean(default true), when move event return `false`, m_drag will stop drag then, if this option is `true`, will revert to previous data
- `touch`:  boolean(default auto detect), if false, will force using mouse event instead of touch event through the browser has `touchmove` event. useful in phantom etc.

## {downHandler}( name, [userdata], moveFunc, upFunc )

**the handler function returned from m_drag, which can be using as handler for onmousedown/touchstart or anything you want to trigger a drag**

- `name`:  string, save internally to back reference, this will allow you to get drag status at any time, make 2 drag interact etc.
- `userdata`:  object, that can pass in customer key&val, can accessable using `data.user` in `moveFunc` and `upFunc` function
	- onmousedown:  special property for `userdata`, which will invoked when `downevent` happens, can be used to hook the downevent.
- `moveFunc`:  function, with 3 parameters( evt, data, root )
	- evt is mousemove/touchmove event object
	- data is object, as below
	````javascript
	{
		ox: number	// mouse position (pageX) when dragstart (e.g. mousedown)
		oy: number	// mouse position (pageY) when dragstart (e.g. mousedown)
		dx: number	// mouse position difference with ox when move occur (e.g. mousemove)
		dy: number	// mouse position difference with oy when move occur (e.g. mousemove)
		pageX: number	// pageX from the event
		pageY: number	// pageY from the event
		user: object	// user data passed with param `userdata`, see above; if omit, this will be {}
	}
	````
- `upFunc`: function, parameters same as `moveFunc`


## {downHandler}.destroy()

**destroy the drag instance, and remove all event listener**


# Tests

Using `ptest` to test with `phantomjs`, run pre-recorded action, make snapshot, and then compare with right snapshot image.

If the two image is same, test passed, else test failed.

`ptest` is another lib that still WIP, will open source at some later time.

# Copyright

MIT


