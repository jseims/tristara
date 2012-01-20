(function($) {

    var methods = {
        init : function( options ) { 
            return this.each(function() {
                var $this = $(this);
                var opts = $.extend({}, $.fn.media_flow.defaults, options);

                if (opts.layout === "liquid") {
                    opts.compressLayout = true;
                }
                
                $this.data("opts", opts);
                $this.data("started", false);
                $this.data("curFrame", 0);
            });
        },
        
        start : function( ) {
            var $this = $(this);
            var started = $this.data("started");
            var opts = $this.data("opts");
            if (!started) {
                $this.data("started", true);
                var frame_x = $this.offset().left;
                var frame_y = $this.offset().top;
                var $div_array = new Array(opts.rows)
                
                if (opts.clipWidth == 0) {
                    if (opts.compressLayout) {
                        opts.clipWidth = opts.totalWidth;
                    } else  {
                        opts.clipWidth = 2 * opts.padding + (opts.cols - 1) * (opts.width + opts.padding);
                    }
                    opts.clipHeight = opts.padding + opts.rows * (opts.height + opts.padding);
                }
                
                // need to insert absolute positioned div for clipping to work
                
                // commenting out top position as it's giving weird effects on whimsy
                //var $temp = $("<div style='position: absolute; top: " + (_frame_y + _offsetTop) + "px; left: " + (_frame_x + _offsetLeft) + "px; clip: rect(" + 0 + "px, " + _clipWidth + "px, " + _clipHeight + "px, " + 0 + "px);'>");

                var $temp = $("<div style='position: absolute; left: " + (frame_x + opts.offsetLeft) + "px; clip: rect(" + 0 + "px, " + opts.clipWidth + "px, " + opts.clipHeight + "px, " + 0 + "px);'>");
                $this.append($temp);
                this.data("top", $temp);
                
                //console.log("x = " + _frame_x + " y = " + _frame_y);
                for(var row = 0; row < opts.rows; row++) {
                    $div_array[row] = new Array();        
                }
                
                $this.data("frame_x", frame_x);
                $this.data("frame_y", frame_y);
                $this.data("div_array", $div_array);
                
                methods.clear($this);
                
                $this.data("intervalId", setInterval(frameStep, 30));
            }
        },
        
        setSpeed : function(speed) {
            var $this = $(this);
            var opts = $this.data("opts");
            opts.speed = speed;
            if (speed === 0) {
                methods.pause();
            } else {
                methods.resume();
            }
        },

        // apply a function to all cells
        map : function(func) {
            var $this = $(this);
            var started = $this.data("started");
            var opts = $this.data("opts");
            var $div_array = $this.data("div_array");
            if (started) {
                for(var row = 0; row < opts.rows; row++) {
                    for(var col = 0; col < $div_array[row].length; col++) {
                        func($div_array[row][col]);
                    }
                }
            }
        },

        pause : function() {
            var $this = $(this);
            var started = $this.data("started");
            var intervalId = $this.data("intervalId");
            if (started) {
                clearInterval(intervalId);
                $this.data("intervalId", -1);
            }
        },

        resume : function() {
            var $this = $(this);
            var started = $this.data("started");
            if (started) {
                $this.data("curFrame", 0);
                var intervalId = $this.data("intervalId");
                if (intervalId === -1) {
                    $this.data("intervalId", setInterval(frameStep, 30));
                }
            }
        },
        
        clear : function($this) {
            var opts = $this.data("opts");
            var $div_array = $this.data("div_array");
            // clear out old values
            for(var row = 0; row < opts.rows; row++) {
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
            for(var row = 0; row < opts.rows; row++) {
                var rows = $div_array[row];
                for(var col = 0; !rowFull(row) && col < 100; col++) {
                    render(row);
                }
            }
        },
    
    };

    $.fn.media_flow = function( method ) {

        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.media_flow' );
        }    

    };

    $.fn.media_flow.defaults = {
        padding : 0,
        clipWidth : 0,
        clipHeight : 0,
        clipLeft : 0,
        clipTop : 0,
        offsetLeft : 0,
        offsetTop : 0,
        speed : 3,
        rows : 0,
        cols : 0,
        width : 0,
        totalWidth : 0,
        height: 0,
        render : function() { console.log("onRender undefined"); },
        getData : function() { console.log("onGetData undefined"); },
        onClick : function() { console.log("onClick undefined"); },
        idle : function() { },
        decorateCell : null,
        layout : "liquid",
        compressLayout : true,
    }
    
    //private functions
    var rowFull = function(row) {
        var $this = $(this);
        var opts = $this.data("opts");
        var $div_array = $this.data("div_array");
        if (opts.compressLayout) {
            var lastX = 0;
            if ($div_array[row].length > 0) {
                var $cell = $div_array[row][$div_array[row].length - 1];
                lastX = $cell.offset().left + $cell.width();
            }
            return lastX > opts.totalWidth;
        } else {
            return $div_array[row].length >= opts.cols;
        }
    }


    var render = function(row) {
        var $this = $(this);
        var opts = $this.data("opts");
        var $div_array = $this.data("div_array");
        var $top = $this.data("top");
        var data = opts.getData();
        
        if (data != null) {
            html = opts.render(data);
            //console.log(data);
            //console.log("html for row " + row + " is " + html);
            var width = opts.width;
            if (opts.compressLayout) {
                width = data.width;
            }
            var $cell = $("<div style='position: absolute; width: " + width + "px;'>" + html + "</div>");
            
            if (opts.decorateCell != null) {
                opts.decorateCell($cell, data);
            }
            
            $top.append($cell);
            
            $cell.click(makeClickCallback(data));
            
            positionCell($cell, row);
            $div_array[row].push($cell);
        }
    }

    var positionCell = function($cell, row) {
        var $this = $(this);
        var opts = $this.data("opts");
        var $div_array = $this.data("div_array");
        var frame_x = $this.data("frame_x");
        var x = 0;
        if ($div_array[row].length > 0) {
            var $lastCell = $div_array[row][$div_array[row].length - 1];
            x = $lastCell.offset().left + $lastCell.width();
            //console.log("position cell, num cells " + $div_array[row].length + " last one's left " + $lastCell.offset().left + " width " + $lastCell.width());
        }
        x += opts.padding - frame_x - opts.offsetLeft;
        
        //var x = 2 * _opts.padding + col * (_width + _opts.padding) - offset;
        var y = opts.padding + row * (opts.height + opts.padding);
        $cell.css( { "left" : x + "px", "top" : y + "px" } );
        //console.log("set x " + x + " frame_x " + _frame_x);
    }

    var scrolledOff = function(row) {
        var $this = $(this);
        var opts = $this.data("opts");
        var $div_array = $this.data("div_array");
        var frame_x = $this.data("frame_x");
        if ($div_array[row].length > 0) {
            var $cell = $div_array[row][0];
            var scroll = opts.padding - ($cell.offset().left - frame_x - opts.offsetLeft + $cell.width());
            //console.log("scroll " + scroll);
            return scroll > 0;
        } else {
            return false;
        }
    }

    var moveLeft = function($cell) {
        var $this = $(this);
        var opts = $this.data("opts");
        var frame_x = $this.data("frame_x");
       // err, I don't know why but every time I set the $cell.offset.left, it would move right by the
       // same number of pixels left that the containing div was (if containing div was also aboslutely positioned)
       // so I substract that distance each time
        $cell.css( { "left" : ($cell.offset().left - opts.speed - frame_x - opts.offsetLeft) + "px" } );
    }
    
    var frameStep = function() {
        var $this = $(this);
        var opts = $this.data("opts");
        var $div_array = $this.data("div_array");
        var curFrame = $this.data("curFrame");

        curFrame++;
        $this.data("curFrame", curFrame);
        // stop playing if no interaction for a while
        if (curFrame > 30 * 5 * 60) {
            idle();
            return;
        }
        
        // move everyone left
        methods.map(moveLeft);

        // check if we need to throw away old thumbs, load new ones
        for(var row = 0; row < opts.rows; row++) {
            if (scrolledOff(row)) {
                // delete first one
                $div_array[row][0].remove();
                
                // compress div_array
                $div_array[row].shift();        
            }
        
            if (!rowFull(row)) {
                // add a new object
                render(row);
            }
        }    
    }

    var idle = function() {
        var $this = $(this);
        var opts = $this.data("opts");
        clearInterval($this.data("intervalId"));
        opts.idle();
    }

        
    // hack to deal with JS scoping weirdness
    var makeClickCallback = function(data) {
        return function() { 
            var $this = $(this);
            var opts = $this.data("opts");
        
            this.data("curFrame", 0);
            opts.onClick(data); 
        };
    }
    
})(jQuery);
