(function($) {

    // really, safari?
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (bind) {
            var self = this;
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return self.apply(bind || null, args);
            };
        };    
    }
    
    var methods = {
        init : function( options ) { 
            return this.each(function() {
                var $this = $(this);
                var opts = $.extend({}, $.fn.media_flow.defaults, options);

                if (opts.layout === "grid") {
                    opts.compressLayout = false;
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
                var $temp = $("<div style='position: absolute; left: " + (state.frame_x + state.opts.offsetLeft) + "px; clip: rect(" + 0 + "px, " + state.opts.clipWidth + "px, " + state.opts.clipHeight + "px, " + 0 + "px);'>");
                $this.append($temp);
                state.$top = $temp;
                
                for(var row = 0; row < state.opts.rows; row++) {
                    state.$div_array[row] = new Array();        
                }
                
                methods.clear.apply(this);
            }
        },
        
        setSpeed : function(speed) {
            var $this = $(this);
            var state = $this.data("flow_state");
            var curPaused = state.paused && state.opts.speed != 0;
            state.opts.speed = speed;
            // pause and resume to apply new speed to animations
            methods.pause.apply(this);
            if (speed > 0 && curPaused === false) {
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
            if (state.started && state.paused === false) {
                state.paused = true;
                state.pauseCells();
            }
        },

        resume : function() {
            var $this = $(this);
            var state = $this.data("flow_state");
            if (state.started && state.paused === true) {
                state.curFrame = 0;
                state.paused = false;
                state.animateCells();
            }
        },
        
        clear : function() {
            var $this = $(this);
            var state = $this.data("flow_state");
            
            if (state.started) {
                // clear out old values
                for(var row = 0; row < state.opts.rows; row++) {
                    var rows = state.$div_array[row];
                    while(true) {
                        var $cell = rows.pop();
                        if ($cell == null) {
                            break;
                        }
                        $cell.stop();
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
        idleFrames : 100,
        render : function() { console.log("onRender undefined"); },
        getData : function() { console.log("onGetData undefined"); },
        onClick : function() { console.log("onClick undefined"); },
        idle : function() { },
        decorateCell : null,
        layout : "grid",
        compressLayout : false,
        useTranslate3d : false,
    }
    
    // internal state object
    function flowState (opts) {
        this.opts = opts;
        this.started = false;
        this.curFrame = 0;
        this.paused = false;
                
        this.render = function(row) {
            var data = this.opts.getData();
            
            if (data != null) {
                html = this.opts.render(data);
                var width = this.opts.width;
                if (this.opts.compressLayout) {
                    width = data.width;
                }
                var $cell = $("<div style='position: absolute; width: " + width + "px;'>" + html + "</div>");
                
                if (this.opts.decorateCell != null) {
                    this.opts.decorateCell($cell, data);
                }
                
                this.$top.append($cell);
                
                $cell.click((function(state, item, cell) { return function () {state.curFrame = 0; state.opts.onClick(item, cell);}}) (this, data, $cell) );
                
                this.positionCell($cell, row);
                this.$div_array[row].push($cell);
                if (!this.paused) {
                    this.animateCell($cell, row);
                }
            }
        };   

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
        
        this.positionCell = function($cell, row) {
            var x = 0;
            if (this.$div_array[row].length > 0) {
                var $lastCell = this.$div_array[row][this.$div_array[row].length - 1];
                x = $lastCell.offset().left + $lastCell.width() - this.frame_x;
                //console.log("position cell, num cells " + this.$div_array[row].length + " last one's left " + $lastCell.offset().left + " width " + $lastCell.width());
            }
            //x += this.opts.padding - this.frame_x - this.opts.offsetLeft;
            x += this.opts.padding - this.opts.offsetLeft;
            
            //var x = 2 * _opts.padding + col * (_width + _opts.padding) - offset;
            var y = this.opts.padding + row * (this.opts.height + this.opts.padding);
            $cell.css( { "left" : x + "px", "top" : y + "px" } );
            //console.log("set x " + x + " frame_x " + this.frame_x);
        };
        
        this.animateCell = function($cell, row) {
            //var left = $cell.offset().left + $cell.width() - this.frame_x - this.opts.offsetLeft - this.opts.padding;
            var left = $cell.offset().left + $cell.width() - this.opts.offsetLeft - this.opts.padding - this.frame_x;
            var time = left * 30 / this.opts.speed;
                
            var animSpec = {left: "-=" + left + "px", leaveTransforms : true, useTranslate3d : this.opts.useTranslate3d};
            //console.log("animateCell left " + left);
            var animOpt = {duration: time, 
                           easing : "linear",
                           complete: ((function(r) {return function() { this.animationDone(r); }}) (row)).bind(this) };

           $cell.animate(animSpec, animOpt);
        };
        
        this.animationDone = function(row) {
            var $cell = this.$div_array[row].shift();
            $cell.remove();
            
            this.render(row);
            
            this.curFrame++;
            if (this.curFrame > this.opts.idleFrames) {
                this.paused = true;
                this.pauseCells();
            }
        };
        
        this.animateCells = function() {
            for(var row = 0; row < this.opts.rows; row++) {
                for(var col = 0; col < this.$div_array[row].length; col++) {
                    var $cell = this.$div_array[row][col];
                    this.animateCell($cell, row);
                }
            }
        };        

        this.pauseCells = function() {
            for(var row = 0; row < this.opts.rows; row++) {
                for(var col = 0; col < this.$div_array[row].length; col++) {
                    var $cell = this.$div_array[row][col];
                    $cell.clearQueue();
                    $cell.stop();
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
            this.paused = true;
            this.pauseCells();
            this.opts.idle();
        };
        
    }
    
})(jQuery);
