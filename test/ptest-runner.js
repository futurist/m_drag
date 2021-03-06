var process = require('process')
var assert = require('assert')
var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var imageDiff=require("image-diff")
var ptest = require('./data/ptest.json')


// colors codes from:
// https://github.com/Marak/colors.js
// https://www.linux.com/learn/docs/man/2752-consolecodes4
var codes = {
  bold: [1, 22],
  underline: [4, 24],
  inverse: [7, 27],

  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  grey: [90, 39],
};

function _color(str, code){
  var _open = []
  var _close = []
  code.split(',').forEach(function( key ){
    var val = codes[key]
    _open.push( '\u001b[' + val[0] + 'm' )
    _close.unshift( '\u001b[' + val[1] + 'm' )
  })
  return _open.join('') + str + _close.join('')
}

var _output = []
var _level = 0
var _beforeEach = null
var _afterEach = null
var _statusColor = {
	'fail': 'red,bold',
	'success': 'green',
	'slow': 'yellow',
	'unknown': 'grey',
}
console.log('')	//start test with newline
function _logStatus(str, level, status){ console.log( _repeat('  ',level||0) + _color( str, _statusColor[status||'unknown'] ) )  }
var _repeat = function(str, level){return new Array(level+1).join(str) }
var _report = function( redraw ){
	var _line = _output.length
	_output.forEach(function(v){
		_logStatus(v.msg, v.level, v.status)
	})
	if(redraw) console.log( _repeat('\u001b[A', _line+1) )
}
function afterEach(func){
	_afterEach = func
}
function describe(msg, func){
	var _stat = {msg:msg, level:_level}
	_output.push(_stat)
	_report(true)
	_level++
	var _this = new func()
	_level--
}
function it(msg, func){
	var _this_level = _level;
	var _stat = {msg:'⋅ ' + msg, level:_this_level}
	func.prototype._timeout = 2000
	func.prototype._slow = 2000
	func.prototype.timeout = function(val){
		this._timeout = val
	}
	func.prototype.slow = function(val){
		this._slow = val
	}
	var callback = function(err){
		_afterEach && _afterEach.call(_this)
		if(err){
			_stat.status = 'fail'
			_report()
			assert(false, err)
			return
		}
		_stat.status = 'success'
		_report(true)
	}
	_output.push(_stat)
	_report(true)
	var _this = new func(callback)
}
process.on('SIGINT', function(code){ _report(true) })
process.on('exit', function(code){ _report(code) })



// test part
var DATA_DIR = 'data/'
function getPath(file){
	return path.join(__dirname, DATA_DIR, file)
}

afterEach(function(){
	if(this.phantom) this.phantom.kill(), this.phantom=null;
})


describe('ptest for '+ptest.url, function () {
	var iter = function(obj){
	  if(typeof obj!='object' || !obj) return;
	  Object.keys(obj).forEach(function(v){
	  	if( typeof obj[v]!=='object') return;
	  	if(obj[v].name && obj[v].span){
	  		it(v+'['+ obj[v].name +']', function(done){
		      this.timeout(obj[v].span*2)
		      this.slow(obj[v].span*1.1)
		      var cmd = 'phantomjs --config=phantom.config ptest-phantom.js '+ ptest.url +' '+obj[v].name
		      // console.log(__dirname, cmd)
		      
		      // delete exists test images
	          var a = obj[v].name +'.png';
	          var b = obj[v].name +'_1.png';
		      [getPath(b), getPath('diff_'+b)].forEach(function(v){
		      	fs.unlink(v, function(err){ 
		      		if(err && err.code!=='ENOENT') throw Error('file or folder permission error') 
		      	})
		      })

		      this.phantom = exec(cmd, {cwd:path.join(__dirname, DATA_DIR)}, function(err, stdout, stderr){
		        // console.log(path.join(__dirname, DATA_DIR), err, stdout, stderr)
		        if(err) return done(err);
		        imageDiff({
				  actualImage: getPath(a),
				  expectedImage: getPath(b),
				  diffImage: getPath('diff_'+b),
				}, function (err, imagesAreSame) {
					err||!imagesAreSame ? done('failed compare ' + b) : done()
				})
		      })
		    })
	  	} else {
	  		describe(v, function(){
	  			iter(obj[v])
	  		})
	  	}
	  })
	}
	iter(ptest.data)
})


