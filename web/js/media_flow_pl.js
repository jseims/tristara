(function($) {

    var methods = {
        init : function( options ) { 
            return this.each(function() {
                var $this = $(this);
                var opts = $.extend({}, $.fn.media_flow.defaults, options);

                if (opts.layout === "liquid") {
                    opts.compressLayout = true;
                }
                
                var state = new flowState(opts);
                
                $this.data("flow_state", state);
            });
        },
        
        start : function( ) {
            var $this = $(this);
            var state = $this.data("flow_state");
            if (!state.started) {
                state.started = true;
                state.frame_x = $this.offset().left;
                state.frame_y = $this.offset().top;
                state.$div_array = new Array(state.opts.rows)
                
                if (state.opts.clipWidth == 0) {
                    if (state.opts.compressLayout) {
                        state.opts.clipWidth = state.opts.totalWidth;
                    } else  {
                        state.opts.clipWidth = 2 * state.opts.padding + (state.opts.cols - 1) * (state.opts.width + state.opts.padding);
                    }
                    state.opts.clipHeight = state.opts.padding + state.opts.rows * (state.opts.height + state.opts.padding);
                }
                
                // need to insert absolute positioned div for clipping to work
                
                // commenting out top position as it's giving weird effects on whimsy
                //var $temp = $("<div style='position: absolute; top: " + (_frame_y + _offsetTop) + "px; left: " + (_frame_x + _offsetLeft) + "px; clip: rect(" + 0 + "px, " + _clipWidth + "px, " + _clipHeight + "px, " + 0 + "px);'>");

                var $temp = $("<div style='position: absolute; left: " + (state.frame_x + state.opts.offsetLeft) + "px; clip: rect(" + 0 + "px, " + state.opts.clipWidth + "px, " + state.opts.clipHeight + "px, " + 0 + "px);'>");
                $this.append($temp);
                state.$top = $temp;
                
                //console.log("x = " + _frame_x + " y = " + _frame_y);
                for(var row = 0; row < state.opts.rows; row++) {
                    state.$div_array[row] = new Array();        
                }
                
                methods.clear.apply(this);
                
                state.intervalId = setInterval(state.frameStep.bind(state), 30)
            }
        },
        
        setSpeed : function(speed) {
            var $this = $(this);
            var state = $this.data("flow_state");
            state.opts.speed = speed;
            if (speed === 0) {
                methods.pause.apply(this);
            } else {
                methods.resume.apply(this);
            }
        },

        // apply a function to all cells
        map : function(func) {
            var $this = $(this);
            var state = $this.data("flow_state");
            state.map(func);
        },

        pause : function() {
            var $this = $(this);
            var state = $this.data("flow_state");
            if (state.started) {
                clearInterval(state.intervalId);
                state.intervalId = -1;
            }
        },

        resume : function() {
            var $this = $(this);
            var state = $this.data("flow_state");
            if (state.started) {
                state.curFrame = 0;
                if (state.intervalId === -1) {
                    state.intervalId = setInterval(state.frameStep.bind(state), 30)
                }
            }
        },
        
        clear : function() {
            var $this = $(this);
            var state = $this.data("flow_state");
            
            // clear out old values
            for(var row = 0; row < state.opts.rows; row++) {
                var rows = state.$div_array[row];
                while(true) {
                    var $cell = rows.pop();
                    if ($cell == null) {
                        break;
                    }
                    $cell.remove();
                }
            }
            
            // now render new ones
            for(var row = 0; row < state.opts.rows; row++) {
                var rows = state.$div_array[row];
                for(var col = 0; !state.rowFull(row) && col < 100; col++) {
                    state.render(row);
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
    
    // internal state object
    function flowState (opts) {
        this.opts = opts;
        this.started = false;
        this.curFrame = 0;
                
        this.rowFull = function(row) {
            if (this.opts.compressLayout) {
                var lastX = 0;
                if (this.$div_array[row].length > 0) {
                    var $cell = this.$div_array[row][this.$div_array[row].length - 1];
                    lastX = $cell.offset().left + $cell.width();
                }
                return lastX > this.opts.totalWidth;
            } else {
                return this.$div_array[row].length >= this.opts.cols;
            }
        };
        
        this.render = function(row) {
            var data = this.opts.getData();
            
            if (data != null) {
                html = this.opts.render(data);
                //console.log(data);
                //console.log("html for row " + row + " is " + html);
                var width = this.opts.width;
                if (this.opts.compressLayout) {
                    width = data.width;
                }
                var $cell = $("<div style='position: absolute; width: " + width + "px;'>" + html + "</div>");
                
                if (this.opts.decorateCell != null) {
                    this.opts.decorateCell($cell, data);
                }
                
                this.$top.append($cell);
                
                $cell.click(this.makeClickCallback.bind(this, data));
                
                this.positionCell($cell, row);
                this.$div_array[row].push($cell);
            }
        };   


        this.positionCell = function($cell, row) {
            var x = 0;
            if (this.$div_array[row].length > 0) {
                var $lastCell = this.$div_array[row][this.$div_array[row].length - 1];
                x = $lastCell.offset().left + $lastCell.width();
                //console.log("position cell, num cells " + $div_array[row].length + " last one's left " + $lastCell.offset().left + " width " + $lastCell.width());
            }
            x += this.opts.padding - this.frame_x - this.opts.offsetLeft;
            
            //var x = 2 * _opts.padding + col * (_width + _opts.padding) - offset;
            var y = this.opts.padding + row * (this.opts.height + this.opts.padding);
            $cell.css( { "left" : x + "px", "top" : y + "px" } );
            //console.log("set x " + x + " frame_x " + _frame_x);
        };

        this.scrolledOff = function(row) {
            if (this.$div_array[row].length > 0) {
                var $cell = this.$div_array[row][0];
                var scroll = this.opts.padding - ($cell.offset().left - this.frame_x - this.opts.offsetLeft + $cell.width());
                //console.log("scroll " + scroll);
                return scroll > 0;
            } else {
                return false;
            }
        };

        this.moveLeft = function($cell) {
           // err, I don't know why but every time I set the $cell.offset.left, it would move right by the
           // same number of pixels left that the containing div was (if containing div was also aboslutely positioned)
           // so I substract that distance each time
            $cell.css( { "left" : ($cell.offset().left - this.opts.speed - this.frame_x - this.opts.offsetLeft) + "px" } );
        };
        
        this.frameStep = function() {
            this.curFrame++;

            // stop playing if no interaction for a while
            if (this.curFrame > 30 * 5 * 60) {
                this.idle();
                return;
            }
            
            // move everyone left
            this.map(this.moveLeft.bind(this));

            // check if we need to throw away old thumbs, load new ones
            for(var row = 0; row < this.opts.rows; row++) {
                if (this.scrolledOff(row)) {
                    // delete first one
                    this.$div_array[row][0].remove();
                    
                    // compress div_array
                    this.$div_array[row].shift();        
                }
            
                if (!this.rowFull(row)) {
                    // add a new object
                    this.render(row);
                }
            }    
        };
        
        this.map = function(func) {
            if (this.started) {
                for(var row = 0; row < this.opts.rows; row++) {
                    for(var col = 0; col < this.$div_array[row].length; col++) {
                        func(this.$div_array[row][col]);
                    }
                }
            }
        };

        this.idle = function() {
            clearInterval(this.intervalId);
            this.intervalId = -1;
            this.opts.idle();
        };

            
        // hack to deal with JS scoping weirdness
        this.makeClickCallback = function(data) {
            return function() { 
                this.curFrame = 0;
                this.opts.onClick(data); 
            };
        };
        
    }




    
})(jQuery);
