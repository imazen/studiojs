/*
* All javascript in this file is released under the MIT license. 
*
* jQuery OverDraw Plugin Copyright(c) 2012 Nathanael Jones
* Created by Andrei http://www.vworker.com/RentACoder/DotNet/SoftwareCoders/ShowBioInfo.aspx?lngAuthorId=6970132
* 
* Custom LZ* compression system written by Nathanael Jones
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.

* The Base64U Encode/decode methods are derived from the MIT-licensed Base64 library by Nick Galbreath
* Copyright (c) 2010 Nick Galbreath
* http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

(function ($) {




    var base64u = {};
    base64u.PADCHAR = '=';
    base64u.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    base64u.makeDOMException = function () {
        var e, tmp;
        try {
            // sadly in FF,Safari,Chrome you can't make a DOMException
            return new DOMException(DOMException.INVALID_CHARACTER_ERR);
        } catch (tmp) {
            var ex = new Error("DOM Exception 5");
            ex.code = ex.number = 5;
            ex.name = ex.description = "INVALID_CHARACTER_ERR";
            ex.toString = function () { return 'Error: ' + ex.name + ': ' + ex.message; };
            return ex;
        }
    }

    base64u.getbyte64 = function (s, i) {
        // This is oddly fast, except on Chrome/V8.
        //  Minimal or no improvement in performance by using a
        //   object with properties mapping chars to value (eg. 'A': 0)
        var idx = base64u.ALPHA.indexOf(s.charAt(i));
        if (idx === -1) throw base64u.makeDOMException();
        return idx;
    }

    base64u.decode = function (s) {
        // convert to string
        s = '' + s;
        var getbyte64 = base64u.getbyte64;
        var pads, i, b10;
        var imax = s.length
        if (imax === 0) return s;

        pads = 0
        if (s.charAt(imax - 1) === base64u.PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === base64u.PADCHAR) {
                pads = 2;
            }
            // either way, we want to ignore this last block
            imax -= 4;
        }

        if (imax % 4 !== 0) {
            pads = (4 - imax % 4) % 4;
            imax -= pads; //Ignore the last block, 
        }

        var x = [];
        for (i = 0; i < imax; i += 4) {
            b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) |
            (getbyte64(s, i + 2) << 6) | getbyte64(s, i + 3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
        }

        switch (pads) {
            case 1:
                b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
                break;
            case 2:
                b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
        }
        return x.join('');
    }

    base64u.getbyte = function (s, i) {
        var x = s.charCodeAt(i);
        if (x > 255) {
            throw base64u.makeDOMException();
        }
        return x;
    }

    base64u.encode = function (s, addPadding) {
        if (arguments.length !== 1) {
            throw new SyntaxError("Not enough arguments");
        }
        var padchar = base64u.PADCHAR;
        var alpha = base64u.ALPHA;
        var getbyte = base64u.getbyte;

        var i, b10;
        var x = [];

        // convert to string
        s = '' + s;

        var imax = s.length - s.length % 3;

        if (s.length === 0) {
            return s;
        }
        for (i = 0; i < imax; i += 3) {
            b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8) | getbyte(s, i + 2);
            x.push(alpha.charAt(b10 >> 18));
            x.push(alpha.charAt((b10 >> 12) & 0x3F));
            x.push(alpha.charAt((b10 >> 6) & 0x3f));
            x.push(alpha.charAt(b10 & 0x3f));
        }
        switch (s.length - imax) {
            case 1:
                b10 = getbyte(s, i) << 16;
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               (addPadding ? (padchar + padchar) : ''));
                break;
            case 2:
                b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8);
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               alpha.charAt((b10 >> 6) & 0x3f) + (addPadding ? (padchar) : ''));
                break;
        }
        return x.join('');

    }
    /*!
    LZW
    /**/
    function lzw_encode(s, alphabet) {
        var alphaDict = null;
        if (alphabet) {
            alphaDict = {};
            var parts = alphabet.split("");
            for (var i = 0; i < parts.length; i++)
                alphaDict[parts[i]] = i;
        }

        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = alphabet ? alphabet.length : 256;
        for (var i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            }
            else {
                out.push(phrase.length > 1 ? dict[phrase] : alphaDict ? alphaDict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : alphaDict ? alphaDict[phrase] : phrase.charCodeAt(0));

        return numbersToString(out);
    }

    function lzw_decode(s, alphabet) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = alphabet ? alphabet.charAt(data[0].charCodeAt(0) - 1) : String.fromCharCode(data[0].charCodeAt(0) - 1);
        var oldPhrase = currChar;
        var out = [currChar];
        var asis = alphabet ? alphabet.length : 256;
        var code = asis;
        var phrase;
        // debugger;
        for (var i = 1; i < data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode >= 128 && i < data.length - 1) {
                currCode = currCode & 0xEF; //Drop leading bit
                currCode = currCode << 8; //Shift to MSB
                currCode = currCode | data[i + 1].charCodeAt(0); //Combine with LSB.
                i++; //Skip forward so we don't read duplicate.
            }
            currCode--; //Since we offset everthing +1 to avoid char 0

            if (currCode < asis) {
                phrase = alphabet ? alphabet.charAt(currCode) : String.fromCharCode(currCode);
            }
            else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    }

    function numbersToString(vals) {
        //Encode so each character is under 256. Support up to 32K
        var bytes = [];
        for (var i = 0; i < vals.length; i++) {
            var v = vals[i] + 1; //Add 1 so we never hit 0
            if (v < 128) bytes.push(String.fromCharCode(v));
            else {
                bytes.push(String.fromCharCode((v >> 8) | 0xF0));
                bytes.push(String.fromCharCode(v % 256));
                if (v > 32768) throw new Error("Dictionary size exceeded 32K, encoding failed!");
            }
        }
        return bytes.join("");
    }

    window.e = lzw_encode;
    window.d = lzw_decode;
    function str_pack(s) {

        return base64u.encode(lzw_encode(s, "012"));
    };

    function str_unpack(s) {
        return lzw_decode(base64u.decode(s), "012");
    };

    /*! Color lookup chart */
    var lookup_color = { '1': 'red', '2': 'green' };
    var lookup_code = { 'red': '1', 'green': '2' };
    /*! Public methods that return values*/
    var public = {
        single: {
            toolbar: function (data) {
                return data.$span_toolbar;
            }
	, string: function (data) {
	    // data = canvas.getImageData(x, y, 1, 1).data;
	    // color = new Color([data[0], data[1], data[2]]);
	    var result = [];
	    var i;
	    for (var i in data.blocks) {
	    }
	    // x( 'Last key: ' + i );
	    for (var j = 0; j <= i; j++) {
	        if (data.blocks[j] === undefined) {
	            result.push(0);
	        } else {
	            result.push(data.blocks[j]);
	        }
	    }
	    return result.join('');
	}
	, pack: function (data) {
	    var input = public.single.string(data);
	    input = input.length === 0 ? 0 : input;

	    return data.block_count + "|" + str_pack(input);
	}
        }
, chain: {
    unload: function (data) {
        /*! Place the "this" element (the image) before the span containing everything else */
        data.$span_relative.before($(this));
        /*! Remove the new elements */
        for (var i in data) {
            if (typeof data[i].remove === 'function') {
                data[i].remove();
            }
        }
        /*! Clear the data object */
        $(this).data('canvasDraw', null);
    }
	, load: function (data, string) {
	    var blocks = [];
	    var length = string.length;
	    for (var i = 0; i < string.length; i++) {
	        var char = string.charAt(i);
	        if (char !== '0') {
	            // x( 'blocks[ ' +i+ ' ] = ' +string.charAt( i )+ ';' );
	            // x( __x +',' + __y );

	            var __x = i % data.stride;
	            var __y = (i - __x) / data.stride;
	            methods.canvasDraw(__x, __y, data, data.$canvas[0], 'small', lookup_color[char]);
	        }
	    }
	}
	, unpack: function (data, compressed) {
	    var string = compressed.split('|');
	    if (data.block_count != parseInt(string[0])) throw new Error("Block count mismatch - attempted to load data with block count " + string[0] + " instead of " + data.block_count);
	    var unpacked = str_unpack(string[1]);
	    public.chain.load(data, unpacked);
	}
}
    };
    /*! Private methods */
    var methods = {
        canvasDraw: function (__x, __y, data, canvas, size, color) {
            if (color === undefined) {
                return;
            }

            /*! data.toolbox.size can return either small, medium or large */
            methods.brushes[size](__x, __y, canvas.getContext('2d'), data, color);
        }
, canvasClick: function (e) {
    var canvas = $(this)[0];
    if (canvas.getContext) {
        /*! Firefox fix */
        if (!e.offsetX) {
            e.offsetX = e.pageX - $(e.target).offset().left;
            e.offsetY = e.pageY - $(e.target).offset().top;
        }
        var data = $(this).data('canvasDraw')
			, __x = Math.floor((e.offsetX) / data.block_size)
			, __y = Math.floor((e.offsetY) / data.block_size)
			;
        methods.canvasDraw(__x, __y, data, canvas, data.toolbox.size, data.toolbox.color);
    }
}
, canvasDrag: function (e) {
    var data = $(this).data('canvasDraw');
    if (data.toolbox.drag === undefined) {
        return false;
    }

    var canvas = $(this)[0];
    if (canvas.getContext) {
        /*! Firefox fix */
        if (!e.offsetX) {
            e.offsetX = e.pageX - $(e.target).offset().left;
            e.offsetY = e.pageY - $(e.target).offset().top;
        }

        var __x = Math.floor((e.offsetX) / data.block_size)
			, __y = Math.floor((e.offsetY) / data.block_size)
			, ctx = canvas.getContext('2d')
			;
        /*! Here is where we make the drawing smooth (no skipping blocks) - we draw lines between 2 subsequent points. */
        if (data.toolbox.dragPrev !== undefined) {
            methods.drawLine(data.toolbox.dragPrev[0], data.toolbox.dragPrev[1], __x, __y, data);
        }
        data.toolbox.dragPrev = [__x, __y];
        /*! data.getSize() can return either small, medium or large */
        // methods.canvasDraw( __x, __y, data, canvas, data.toolbox.size, data.toolbox.color );
    }
}
, canvasDragStop: function (data) {
    return function () {
        data.toolbox.drag = undefined;
        data.toolbox.dragPrev = undefined;
    }
}
, brushes: {
    small: function (__x, __y, ctx, data, color) {
        /*! None of the indexes can be negative */
        if (__x < 0 || __y < 0 || __x >= data.stride || __y >= data.arrayHeight) {
            // x( 'Ignoring ' + __x + ':' + __y );
            return;
        }
        var index = data.stride * __y + __x;
        /*! If the current block already has this color, don't bother to reapply */
        if (lookup_color[data.blocks[index]] === color) {
            return;
        }
        // x( 'Filling block ' + __x +':'+ __y + ' with color ' + color );
        /*! Color can be either: green, red or erase */
        if (color === 'erase') {
            ctx.clearRect(__x * data.block_size, __y * data.block_size, data.block_size, data.block_size);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(__x * data.block_size, __y * data.block_size, data.block_size, data.block_size);
        }
        data.blocks[index] = color === 'erase' ? undefined : lookup_code[color]
    }
	, medium: function (__x, __y, ctx, data) {
	    methods.brushes.small(__x, __y, ctx, data, data.toolbox.color);
	    methods.brushes.small(__x + 1, __y, ctx, data, data.toolbox.color);
	}
	, large: function (__x, __y, ctx, data) {
	    methods.brushes.small(__x, __y, ctx, data, data.toolbox.color);
	    methods.brushes.small(__x + 1, __y, ctx, data, data.toolbox.color);
	    methods.brushes.small(__x - 1, __y, ctx, data, data.toolbox.color);
	    methods.brushes.small(__x, __y + 1, ctx, data, data.toolbox.color);
	    methods.brushes.small(__x, __y - 1, ctx, data, data.toolbox.color);
	}
    // ,	huge: function( __x, __y, ctx, data ) {
    // for( var i = 0; i < 50; i++ ) {
    // methods.brushes.small( __x +i, __y, ctx, data, data.toolbox.color  );
    // methods.brushes.small( __x -i, __y, ctx, data, data.toolbox.color  );
    // methods.brushes.small( __x, __y +i, ctx, data, data.toolbox.color  );
    // methods.brushes.small( __x, __y -i, ctx, data, data.toolbox.color  );
    // }
    // }
}
, toolSelect: function (data, tool) {
    return function () {
        data.toolbox[tool] = $(this).val()
        // x( tool + ',' + $( this ).val() );
        switch ($(this).val()) {
            case 'green': data.$canvas.removeClass('red erase').addClass('green'); break;
            case 'red': data.$canvas.removeClass('green erase').addClass('red'); break;
            case 'erase': data.$canvas.removeClass('red green').addClass('erase'); break;
        }
    }
}
, log: function (msg) {
    if (console && console.log) {
        console.log(msg);
    }
}
, isInitialized: function (data) {
    return (typeof data === 'object' && data !== null);
}
, drawLine: function (x1, y1, x2, y2, data) {
    /*!
    The equation of a straight line: (y - y1)/(y2 - y1) = (x - x1)/(x2 - x1)
    http://www.cut-the-knot.org/Curriculum/Calculus/StraightLine.shtml
    /**/
    /*! If the slope is < 45 degrees (if the angle is closer to the horizontal => the distance between the X's is greater) */
    if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
        var xmin = Math.min(x1, x2);
        var xmax = Math.max(x1, x2);
        for (var i = xmin; i <= xmax; ++i) {
            if (x1 === x2) {
                _y = y1;
            } else {
                _y = Math.round(((i - x1) / (x2 - x1)) * (y2 - y1) + y1);
            }
            methods.canvasDraw(i, _y, data, data.$canvas[0], data.toolbox.size, data.toolbox.color);
        }
    } else {
        var ymin = Math.min(y1, y2);
        var ymax = Math.max(y1, y2);
        for (var i = ymin; i <= ymax; ++i) {
            if (y1 === y2) {
                _x = x1;
            } else {
                _x = Math.round(((i - y1) / (y2 - y1)) * (x2 - x1) + x1);
            }
            methods.canvasDraw(_x, i, data, data.$canvas[0], data.toolbox.size, data.toolbox.color);
        }
    }
}
    }

    $.fn.canvasDraw = function (mixed, arg) {
        /*! If a public function has been called to return a value */
        if (public.single[mixed] !== undefined) {
            var data = this.first().data('canvasDraw');
            if (!methods.isInitialized(data)) {
                return methods.log('Plugin isn\'t initialized');
            }
            return public.single[mixed].call(this, data);
        }
        return this.each(function () {
            var $img = $(this)
		, data = $img.data('canvasDraw')
		;

            /*! If a public chainable function has been called */
            if (public.chain[mixed] !== undefined) {
                if (!methods.isInitialized(data)) {
                    return methods.log('Plugin isn\'t initialized');
                }
                public.chain[mixed].call(this, data, arg);
            }

            /*! If the plugin hasn't been initialized */
            if (!methods.isInitialized(data)) {
                var width = $img.width()
			, height = $img.height()
			, C = (mixed !== undefined && mixed.C !== undefined) ? mixed.C : 1000
            , controlParent = (mixed !== undefined) ? mixed.controlParent : null
			;
                $img.data('canvasDraw', data = {
                   
                    blocks: []
			, $canvas: $('<canvas width="' + width + '" height="' + height + '" />').css('opacity', '0.5')
			, $span_relative: $('<div />', { style: 'position: relative;' })
			, $span_absolute: $('<span />', { style: 'position: absolute; top: 0; left: 0;' })
			, $span_toolbar: $('<span />')
            , block_count: C
			, block_size: Math.floor(Math.sqrt(width * height / C))
			, toolbox: {}
                });
                data.stride = Math.ceil(width / data.block_size);
                data.arrayHeight = Math.ceil(height / data.block_size);

                /*! The canvas shares the data object with the image */
                data.$canvas.data('canvasDraw', data);

                /*! Insert a span with relative positioning before the IMG */
                $img.before(data.$span_relative);
                /*! Move the IMG inside that span */
                data.$span_relative.append($img);
                /*! Add to that span another span with absolute positioning */
                data.$span_relative.append(data.$span_absolute);
                /*! Add the canvas inside the span with absolute positioning */
                data.$span_absolute.append(data.$canvas);

                /*! Add the event listener */
                data.$canvas.click(methods.canvasClick);
                data.$canvas.mousemove(methods.canvasDrag);
                data.$canvas.mousedown(function () { data.toolbox.drag = true; });
                data.$canvas.mouseup(methods.canvasDragStop(data));
                data.$canvas.mouseout(methods.canvasDragStop(data));

                /*! Building the toolbar */
                var tools = {
                    'size': { 'small': 0, 'medium': 1, 'large': 2 }
			, 'color': { 'green': 0, 'red': 1, 'erase': 2 }
                };
                var rand = Math.random();
                for (var tool in tools) {
                    var $div = $('<div />');
                    for (var type in tools[tool]) {
                        var $tool = $('<input type="radio" id="' + tool + type + rand + '" name="' + tool + rand + '" value="' + type + '" />');
                        $div.append($tool).append($('<label for="' + tool + type + rand + '">' + type + '</label>'));
                        $tool.data('canvasDraw', data).click(methods.toolSelect(data, tool));
                    }
                    data.$span_toolbar.append($div.buttonset());
                }
                if (controlParent) {
                    $(controlParent).append(data.$span_toolbar);
                } else {
                    data.$span_relative.append('<br />');
                    data.$span_relative.append(data.$span_toolbar);
                }

                /*! Set the default values */
                $('input[name="color' + rand + '"]:first').click();
                $('input[name="size' + rand + '"]:first').click();
            }
        });
    };

})(jQuery);