var media_flow = media_flow || {};

var $top;
var $div_array;
var _data_array;
var _frame_x;
var _frame_y;

var _speed = 3;
var _rows = 0;
var _cols = 0;
var _width = 0;
var _height = 0;
var _padding = 10;
var _clipWidth = 0;
var _clipHeight = 0;
var _clipLeft = 0;
var _clipTop = 0;
var _offsetLeft = 0;
var _offsetTop = 0;

var _started = false;
var _curFrame = 0;
var _intervalId;

var _render = function() { console.log("onRender undefined"); }
var _getData = function() { console.log("onGetData undefined"); }
var _onClick = function() { console.log("onClick undefined"); }
var _idle = function() { }

media_flow.setDimensions = function(rows, cols, width, height, padding, clipWidth, clipHeight, offsetLeft, offsetTop) {
    _rows = rows;
    _cols = cols;
    _width = width;
    _height = height;
    if (padding) {
        _padding = padding;
    }
    if (clipWidth) {
        _clipWidth = clipWidth;
    }
    if (clipHeight) {
        _clipHeight = clipHeight;
    }
    if (offsetLeft) {
        _offsetLeft = offsetLeft;
    }
    if (offsetTop) {
        _offsetTop = offsetTop;
    }    
}

media_flow.setSpeed = function(speed) {
    _speed = speed;
}

media_flow.onRender = function(render) {
    _render = render;
}

media_flow.onClick = function(onClick) {
    _onClick = onClick;
}

media_flow.onGetData = function(getData) {
    _getData = getData;
}

media_flow.onIdle = function(idle) {
    _idle = idle;
}

media_flow.start = function(parent_div) {
    if (!_started) {
        _started = true;
        $top = $('#' + parent_div);
        _frame_x = $top.offset().left;
        _frame_y = $top.offset().top;
        
        if (_clipWidth == 0) {
            _clipWidth = 2 * _padding + (_cols - 1) * (_width + _padding);
            _clipHeight = _padding + _rows * (_height + _padding);
        }
        
        // need to insert absolute positioned div for clipping to work
        var $temp = $("<div style='position: absolute; top: " + (_frame_y + _offsetTop) + "px; left: " + (_frame_x + _offsetLeft) + "px; clip: rect(" + 0 + "px, " + _clipWidth + "px, " + _clipHeight + "px, " + 0 + "px);'>");
        $top.append($temp);
        $top = $temp;
        
        //console.log("x = " + _frame_x + " y = " + _frame_y);
        $div_array = new Array(_rows)
        _data_array = new Array(_rows)
        for(var row = 0; row < _rows; row++) {
            $div_array[row] = new Array(_cols);        
            _data_array[row] = new Array(_cols);        
            for(var col = 0; col < _cols; col++) {
                var $cell = $("<div style='position: absolute;'>");
                //var $cell = $("<div>");
                $top.append($cell);
                $div_array[row][col] = $cell;
                media_flow.positionCell($cell, row, col, 0);
                
                if (col === _cols - 1) {
                    media_flow.render(row, col);
                }
            }
        }
        
        _intervalId = setInterval(media_flow.frameStep, 30);
    }
}

media_flow.positionCell = function($cell, row, col, offset) {
    var x = 2 * _padding + col * (_width + _padding) - offset;
    var y = _padding + row * (_height + _padding);
    $cell.css( { "left" : x + "px", "top" : y + "px" } );
}

media_flow.scrolledOff = function($cell) {
    var scroll = _padding - ($cell.offset().left - _frame_x - _offsetLeft + _width);
    //console.log("scroll " + scroll);
    return scroll;
}

media_flow.moveLeft = function($cell) {
   // err, I don't know why but every time I set the $cell.offset.left, it would move right by the
   // same number of pixels left that the containing div was (if containing div was also aboslutely positioned)
   // so I substract that distance each time
    //console.log("before " + $cell.offset().left);
    $cell.css( { "left" : ($cell.offset().left - _speed - _frame_x - _offsetLeft) + "px" } );
    //console.log("after " + $cell.offset().left);
    
}

media_flow.frameStep = function() {
    _curFrame++;
    // stop playing if no interaction for a while
    if (_curFrame > 30 * 5 * 60) {
        media_flow.idle();
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
            var $col = $("<div style='position: absolute;'>");
            $top.append($col);
            $div_array[row][_cols - 1] = $col;
            media_flow.positionCell($col, row, _cols - 1, offset);
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
    _data_array[row][col] = _getData();
    html = _render(_data_array[row][col]);
    //console.log("html for row " + row + " col " + col + " is " + html);
    $div_array[row][col].append($("<div>" + html + "</div>"));
    $div_array[row][col].click(media_flow.makeClickCallback(_data_array[row][col]));
}

// hack to deal with JS scoping weirdness
media_flow.makeClickCallback = function(data) {
    return function() { 
        _curFrame = 0;
        _onClick(data); 
    };
}
