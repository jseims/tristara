var media_flow = media_flow || {};

var $top;
var $div_array;
var _data_array;
var _frame_x;
var _frame_y;

var _rows = 0;
var _cols = 0;
var _width = 0;
var _height = 0;

var _opts;
var _defaults = {
    padding : 0,
    clipWidth : 0,
    clipHeight : 0,
    clipLeft : 0,
    clipTop : 0,
    offsetLeft : 0,
    offsetTop : 0,
    speed : 3,
    render : function() { console.log("onRender undefined"); },
    getData : function() { console.log("onGetData undefined"); },
    onClick : function() { console.log("onClick undefined"); },
    idle : function() { },
    onEnter : null,
    onLeave : null,
    onFocus : null,
    outFocus : null,
    clearFocus : null,
};

var _padding = 0;
var _clipWidth = 0;
var _clipHeight = 0;
var _clipLeft = 0;
var _clipTop = 0;
var _offsetLeft = 0;
var _offsetTop = 0;

var _started = false;
var _curFrame = 0;
var _intervalId;

media_flow.setDimensions = function(rows, cols, width, height, options) {
    _rows = rows;
    _cols = cols;
    _width = width;
    _height = height;
    _opts = $.extend({}, _defaults, options);
}

/*
media_flow.onHover = function(hoverIn, hoverOut) {
    _hoverIn = hoverIn;
    _hoverOut = hoverOut;
}*/

media_flow.start = function(parent_div) {
    if (!_started) {
        _started = true;
        $top = $('#' + parent_div);
        _frame_x = $top.offset().left;
        _frame_y = $top.offset().top;
        
        if (_opts.clipWidth == 0) {
            _opts.clipWidth = 2 * _opts.padding + (_cols - 1) * (_width + _opts.padding);
            _opts.clipHeight = _opts.padding + _rows * (_height + _opts.padding);
        }
        
        // need to insert absolute positioned div for clipping to work
        
        // commenting out top position as it's giving weird effects on whimsy
        //var $temp = $("<div style='position: absolute; top: " + (_frame_y + _offsetTop) + "px; left: " + (_frame_x + _offsetLeft) + "px; clip: rect(" + 0 + "px, " + _clipWidth + "px, " + _clipHeight + "px, " + 0 + "px);'>");

        var $temp = $("<div style='position: absolute; left: " + (_frame_x + _opts.offsetLeft) + "px; clip: rect(" + 0 + "px, " + _opts.clipWidth + "px, " + _opts.clipHeight + "px, " + 0 + "px);'>");
        $top.append($temp);
        $top = $temp;
        
        // setup enter / leave handlers
        if (_opts.onEnter) {
            $top.mouseenter(_opts.onEnter);
        }
        if (_opts.onLeave) {
            $top.mouseleave(media_flow.leaveWrapper);
        }
        
        //console.log("x = " + _frame_x + " y = " + _frame_y);
        $div_array = new Array(_rows)
        _data_array = new Array(_rows)
        for(var row = 0; row < _rows; row++) {
            $div_array[row] = new Array(_cols);        
            _data_array[row] = new Array(_cols);        
            for(var col = 0; col < _cols; col++) {
            
                media_flow.createCell(row, col, 0);
                
                if (col === _cols - 1) {
                    media_flow.render(row, col);
                }
            }
        }
        
        _intervalId = setInterval(media_flow.frameStep, 30);
    }
}

media_flow.createCell = function(row, col, offset) {
    var $cell = $("<div style='position: absolute;'>");
    //var $cell = $("<div>");
    $top.append($cell);
    $div_array[row][col] = $cell;
    media_flow.positionCell($cell, row, col, offset);
}

media_flow.positionCell = function($cell, row, col, offset) {
    var x = 2 * _opts.padding + col * (_width + _opts.padding) - offset;
    var y = _opts.padding + row * (_height + _opts.padding);
    $cell.css( { "left" : x + "px", "top" : y + "px" } );
}

media_flow.scrolledOff = function($cell) {
    var scroll = _opts.padding - ($cell.offset().left - _frame_x - _opts.offsetLeft + _width);
    //console.log("scroll " + scroll);
    return scroll;
}

media_flow.moveLeft = function($cell) {
   // err, I don't know why but every time I set the $cell.offset.left, it would move right by the
   // same number of pixels left that the containing div was (if containing div was also aboslutely positioned)
   // so I substract that distance each time
    //console.log("before " + $cell.offset().left);
    $cell.css( { "left" : ($cell.offset().left - _opts.speed - _frame_x - _opts.offsetLeft) + "px" } );
    //console.log("after " + $cell.offset().left);
    
}

media_flow.frameStep = function() {
    _curFrame++;
    // stop playing if no interaction for a while
    if (_curFrame > 30 * 5 * 60) {
        _opts.idle();
        return;
    }

    // move everyone left
    for(var row = 0; row < _rows; row++) {
        for(var col = 0; col < _cols; col++) {
            var $cell = $div_array[row][col];
            media_flow.moveLeft($cell);
        }
    }
    
    // check if we need to throw away old thumbs, load new ones
    var offset = media_flow.scrolledOff($div_array[0][0]);
    //console.log("offset = " + offset);
    if (offset > 0) {
        for(var row = 0; row < _rows; row++) {
            // delete first one
            $div_array[row][0].remove();
            
            // compress div_array
            for(var col = 0; col < _cols - 1; col++) {
                $div_array[row][col] = $div_array[row][col + 1];
            }
            
            // add a new object
            media_flow.createCell(row, _cols - 1, offset);
            
            media_flow.render(row, _cols - 1);
        }
    }    
}

media_flow.clear = function() {
    for(var row = 0; row < _rows; row++) {
        for(var col = 0; col < _cols; col++) {
            var $cell = $div_array[row][col];
            $cell.text("");
        }
    }
}

media_flow.idle = function() {
    clearInterval(_intervalId);
    _idle();
}

media_flow.pause = function() {
    clearInterval(_intervalId);
    _intervalId = -1;
}

media_flow.resume = function() {
    _curFrame = 0;
    if (_intervalId == -1) {
        _intervalId = setInterval(media_flow.frameStep, 30);
    }
}

media_flow.render = function(row, col) {
    _data_array[row][col] = _opts.getData();
    html = _opts.render(_data_array[row][col]);
    //console.log("html for row " + row + " col " + col + " is " + html);
    
    var $cell = $("<div>" + html + "</div>");
    $div_array[row][col].append($cell);
    $div_array[row][col].click(media_flow.makeClickCallback(_data_array[row][col]));
    if (_opts.onFocus != null) {
        $div_array[row][col].mouseenter(media_flow.makeFocusCallback($div_array[row][col], _data_array[row][col]));
    }
}

media_flow.focusHandler = function(div, content) {
    if (_opts.outFocus != null) {
        for(var row = 0; row < _rows; row++) {
            for(var col = 0; col < _cols; col++) {
                if ($div_array[row][col] != div) {
                    _opts.outFocus($div_array[row][col]);
                }
            }
        }
    }
    _opts.onFocus(div, content);
}

media_flow.leaveWrapper = function(event) {
    if (_opts.clearFocus != null) {
        for(var row = 0; row < _rows; row++) {
            for(var col = 0; col < _cols; col++) {
                _opts.clearFocus($div_array[row][col]);
            }
        }
    }
    _opts.onLeave(event);
}

// hack to deal with JS scoping weirdness
media_flow.makeClickCallback = function(data) {
    return function() { 
        _curFrame = 0;
        _opts.onClick(data); 
    };
}

media_flow.makeFocusCallback = function(div, content) {
    return function() { 
        media_flow.focusHandler(div, content); 
    };
}

