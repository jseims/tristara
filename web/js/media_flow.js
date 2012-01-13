var media_flow = media_flow || {};

var $top;
var $div_array;
var _frame_x;
var _frame_y;

var _rows = 0;
var _cols = 0;
var _width = 0;
var _height = 0;
var _totalWidth = 0;
var _compressLayout = false;

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
    decorateCell : null,
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

media_flow.setGridDimensions = function(rows, cols, width, height, options) {
    _rows = rows;
    _cols = cols;
    _width = width;
    _height = height;
    _compressLayout = false;
    _opts = $.extend({}, _defaults, options);
}

media_flow.setLiquidDimensions = function(rows, totalWidth, height, options) {
    _rows = rows;
    _totalWidth = totalWidth;
    _height = height;
    _compressLayout = true;
    _opts = $.extend({}, _defaults, options);
}

media_flow.start = function(parent_div) {
    if (!_started) {
        _started = true;
        $top = $('#' + parent_div);
        _frame_x = $top.offset().left;
        _frame_y = $top.offset().top;
        
        if (_opts.clipWidth == 0) {
            if (_compressLayout) {
                _opts.clipWidth = _totalWidth;
            } else  {
                _opts.clipWidth = 2 * _opts.padding + (_cols - 1) * (_width + _opts.padding);
            }
            _opts.clipHeight = _opts.padding + _rows * (_height + _opts.padding);
        }
        
        // need to insert absolute positioned div for clipping to work
        
        // commenting out top position as it's giving weird effects on whimsy
        //var $temp = $("<div style='position: absolute; top: " + (_frame_y + _offsetTop) + "px; left: " + (_frame_x + _offsetLeft) + "px; clip: rect(" + 0 + "px, " + _clipWidth + "px, " + _clipHeight + "px, " + 0 + "px);'>");

        var $temp = $("<div style='position: absolute; left: " + (_frame_x + _opts.offsetLeft) + "px; clip: rect(" + 0 + "px, " + _opts.clipWidth + "px, " + _opts.clipHeight + "px, " + 0 + "px);'>");
        $top.append($temp);
        $top = $temp;
        
        //console.log("x = " + _frame_x + " y = " + _frame_y);
        $div_array = new Array(_rows)
        for(var row = 0; row < _rows; row++) {
            $div_array[row] = new Array();        
        }
        
        media_flow.clear();
        
        _intervalId = setInterval(media_flow.frameStep, 30);
    }
}

media_flow.clear = function() {
    // clear out old values
    for(var row = 0; row < _rows; row++) {
        var rows = $div_array[row];
        while(true) {
            var $cell = rows.pop();
            if ($cell == null) {
                break;
            }
            $cell.remove();
        }
    }
    
    // now render new ones
    for(var row = 0; row < _rows; row++) {
        var rows = $div_array[row];
        for(var col = 0; !media_flow.rowFull(row) && col < 100; col++) {
            media_flow.render(row);
        }
    }
}

media_flow.rowFull = function(row) {
    if (_compressLayout) {
        var lastX = 0;
        if ($div_array[row].length > 0) {
            var $cell = $div_array[row][$div_array[row].length - 1];
            lastX = $cell.offset().left + $cell.width();
        }
        return lastX > _totalWidth;
    } else {
        return $div_array[row].length >= _cols;
    }
}


media_flow.render = function(row) {
    var data = _opts.getData();
    
    if (data != null) {
        html = _opts.render(data);
        //console.log(data);
        //console.log("html for row " + row + " is " + html);
        var width = _width;
        if (_compressLayout) {
            width = data.width;
        }
        var $cell = $("<div style='position: absolute; width: " + width + "px;'>" + html + "</div>");
        
        if (_opts.decorateCell != null) {
            _opts.decorateCell($cell, data);
        }
        
        $top.append($cell);
        
        $cell.click(media_flow.makeClickCallback(data));
        
        media_flow.positionCell($cell, row);
        $div_array[row].push($cell);
    }
}

media_flow.positionCell = function($cell, row) {
    var x = 0;
    if ($div_array[row].length > 0) {
        var $lastCell = $div_array[row][$div_array[row].length - 1];
        x = $lastCell.offset().left + $lastCell.width();
        //console.log("position cell, num cells " + $div_array[row].length + " last one's left " + $lastCell.offset().left + " width " + $lastCell.width());
    }
    x += _opts.padding - _frame_x - _opts.offsetLeft;
    
    //var x = 2 * _opts.padding + col * (_width + _opts.padding) - offset;
    var y = _opts.padding + row * (_height + _opts.padding);
    $cell.css( { "left" : x + "px", "top" : y + "px" } );
    //console.log("set x " + x + " frame_x " + _frame_x);
}

media_flow.scrolledOff = function(row) {
    if ($div_array[row].length > 0) {
        var $cell = $div_array[row][0];
        var scroll = _opts.padding - ($cell.offset().left - _frame_x - _opts.offsetLeft + $cell.width());
        //console.log("scroll " + scroll);
        return scroll > 0;
    } else {
        return false;
    }
}

media_flow.moveLeft = function($cell) {
   // err, I don't know why but every time I set the $cell.offset.left, it would move right by the
   // same number of pixels left that the containing div was (if containing div was also aboslutely positioned)
   // so I substract that distance each time
    $cell.css( { "left" : ($cell.offset().left - _opts.speed - _frame_x - _opts.offsetLeft) + "px" } );
    
}

media_flow.frameStep = function() {
    _curFrame++;
    // stop playing if no interaction for a while
    if (_curFrame > 30 * 5 * 60) {
        _opts.idle();
        return;
    }

    // move everyone left
    media_flow.map(media_flow.moveLeft);

    // check if we need to throw away old thumbs, load new ones
    for(var row = 0; row < _rows; row++) {
        if (media_flow.scrolledOff(row)) {
            // delete first one
            $div_array[row][0].remove();
            
            // compress div_array
            $div_array[row].shift();        
        }
    
        if (!media_flow.rowFull(row)) {
            // add a new object
            media_flow.render(row);
        }
    }    
}

// apply a function to all cells
media_flow.map = function(func) {
    if (_started) {
        for(var row = 0; row < _rows; row++) {
            for(var col = 0; col < $div_array[row].length; col++) {
                func($div_array[row][col]);
            }
        }
    }
}

media_flow.idle = function() {
    clearInterval(_intervalId);
    _idle();
}

media_flow.pause = function() {
    if (_started) {
        clearInterval(_intervalId);
        _intervalId = -1;
    }
}

media_flow.resume = function() {
    if (_started) {
        _curFrame = 0;
        if (_intervalId == -1) {
            _intervalId = setInterval(media_flow.frameStep, 30);
        }
    }
}

// hack to deal with JS scoping weirdness
media_flow.makeClickCallback = function(data) {
    return function() { 
        _curFrame = 0;
        _opts.onClick(data); 
    };
}

