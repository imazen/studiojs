( function( $ ) {
/*!
LZW
/**/
function lzw_encode(s) {
	var dict = {};
	var data = (s + "").split("");
	var out = [];
	var currChar;
	var phrase = data[0];
	var code = 256;
	for (var i=1; i<data.length; i++) {
		currChar=data[i];
		if (dict[phrase + currChar] != null) {
			phrase += currChar;
		}
		else {
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			dict[phrase + currChar] = code;
			code++;
			phrase=currChar;
		}
	}
	out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	for (var i=0; i<out.length; i++) {
		out[i] = String.fromCharCode(out[i]);
	}
	return out.join("");
}

function lzw_decode(s) {
	var dict = {};
	var data = (s + "").split("");
	var currChar = data[0];
	var oldPhrase = currChar;
	var out = [currChar];
	var code = 256;
	var phrase;
	// debugger;
	for (var i=1; i<data.length; i++) {
		var currCode = data[i].charCodeAt(0);
		if (currCode < 256) {
			phrase = data[i];
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
/*! Color lookup chart */
var lookup_color = { '1': 'red', '2': 'green' };
var lookup_code = { 'red': '1', 'green': '2' };
/*! Public methods that return values*/
var public = {
	single: {
		toolbar: function( data ) {
			return data.$span_toolbar;
		}
	,	string: function( data ) {
			// data = canvas.getImageData(x, y, 1, 1).data;
			// color = new Color([data[0], data[1], data[2]]);
			var result = [];
			var i;
			for( var i in data.blocks ) {
			}
			// x( 'Last key: ' + i );
			for( var j = 0; j <= i; j++ ) {
				if ( data.blocks[ j ] === undefined ) {
					result.push( 0 );
				} else {
					result.push( data.blocks[ j ] );
				}
			}
			return result.join('');
		}
	,	pack: function( data ) {
			var input = public.single.string( data );
			input = input.length === 0 ? 0 : input;
			
			return lzw_encode( input );
		}
	}
,	chain: {
		unload: function( data ) {
			/*! Place the "this" element (the image) before the span containing everything else */
			data.$span_relative.before( $( this ) );
			/*! Remove the new elements */
			for( var i in data ) {
				if ( typeof data[ i ].remove === 'function' ) {
					data[ i ].remove();
				}
			}
			/*! Clear the data object */
			$( this ).data( 'canvasDraw', null );
		}
	,	load: function( data, string ) {
			var blocks = [];
			var length = string.length;
			for ( var i = 0; i < string.length; i++ ) {
				var char = string.charAt( i );
				if ( char !== '0' ) {
					// x( 'blocks[ ' +i+ ' ] = ' +string.charAt( i )+ ';' );
					// x( __x +',' + __y );
					
					var __x = i % data.stride;
					var __y = ( i -__x ) / data.stride;
					methods.canvasDraw( __x, __y, data, data.$canvas[ 0 ], 'small', lookup_color[ char ] );
				}
			}
		}
	,	unpack: function( data, compressed ) {
			var string = lzw_decode( compressed );
			public.chain.load( data, string );
		}
	}
};
/*! Private methods */
var methods = {
	canvasDraw: function( __x, __y, data, canvas, size, color ) {
		if( color === undefined ) {
			return;
		}
		
		/*! data.toolbox.size can return either small, medium or large */
		methods.brushes[ size ]( __x, __y, canvas.getContext( '2d' ), data, color );
	}
,	canvasClick: function( e ) {
		var canvas = $( this )[ 0 ];
		if ( canvas.getContext ) {
			/*! Firefox fix */
			if ( ! e.offsetX ) {
				e.offsetX = e.pageX - $( e.target ).offset().left;
				e.offsetY = e.pageY - $( e.target ).offset().top;
			}
			var data = $( this ).data( 'canvasDraw' )
			,	__x = Math.floor( ( e.offsetX ) / data.block_size )
			,	__y = Math.floor( ( e.offsetY ) / data.block_size )
			;
			methods.canvasDraw( __x, __y, data, canvas, data.toolbox.size, data.toolbox.color );
		}
	}
,	canvasDrag: function( e ) {
		var data = $( this ).data( 'canvasDraw' );
		if( data.toolbox.drag === undefined ) {
			return false;
		}
		
		var canvas = $( this )[ 0 ];
		if ( canvas.getContext ) {
			/*! Firefox fix */
			if ( ! e.offsetX ) {
				e.offsetX = e.pageX - $( e.target ).offset().left;
				e.offsetY = e.pageY - $( e.target ).offset().top;
			}
			
			var __x = Math.floor( ( e.offsetX ) / data.block_size )
			,	__y = Math.floor( ( e.offsetY ) / data.block_size )
			,	ctx = canvas.getContext( '2d' )
			;
			/*! Here is where we make the drawing smooth (no skipping blocks) - we draw lines between 2 subsequent points. */
			if( data.toolbox.dragPrev !== undefined ) {
				methods.drawLine( data.toolbox.dragPrev[ 0 ], data.toolbox.dragPrev[ 1 ], __x, __y, data );
			}
			data.toolbox.dragPrev = [ __x, __y ];
			/*! data.getSize() can return either small, medium or large */
			// methods.canvasDraw( __x, __y, data, canvas, data.toolbox.size, data.toolbox.color );
		}
	}
,	canvasDragStop: function( data ) {
		return function() {
			data.toolbox.drag = undefined;
			data.toolbox.dragPrev = undefined;
		}
	}
,	brushes: {
		small: function( __x, __y, ctx, data, color ) {
			/*! None of the indexes can be negative */
			if( __x < 0 || __y < 0 || __x >= data.stride || __y >= data.arrayHeight ) {
				// x( 'Ignoring ' + __x + ':' + __y );
				return;
			}
			var index = data.stride * __y + __x;
			/*! If the current block already has this color, don't bother to reapply */
			if ( lookup_color[ data.blocks[ index ] ] === color ) {
				return;
			}
			// x( 'Filling block ' + __x +':'+ __y + ' with color ' + color );
			/*! Color can be either: green, red or erase */
			if ( color === 'erase' ) {
				ctx.clearRect( __x * data.block_size, __y * data.block_size, data.block_size, data.block_size );
			} else {
				ctx.fillStyle = color;
				ctx.fillRect( __x * data.block_size, __y * data.block_size, data.block_size, data.block_size );
			}
			data.blocks[ index ] = color === 'erase' ? undefined: lookup_code[ color ]
		}
	,	medium: function( __x, __y, ctx, data ) {
			methods.brushes.small( __x, __y, ctx, data, data.toolbox.color  );
			methods.brushes.small( __x +1, __y, ctx, data, data.toolbox.color  );
		}
	,	large: function( __x, __y, ctx, data ) {
			methods.brushes.small( __x, __y, ctx, data, data.toolbox.color  );
			methods.brushes.small( __x +1, __y, ctx, data, data.toolbox.color  );
			methods.brushes.small( __x -1, __y, ctx, data, data.toolbox.color  );
			methods.brushes.small( __x, __y +1, ctx, data, data.toolbox.color  );
			methods.brushes.small( __x, __y -1, ctx, data, data.toolbox.color  );
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
,	toolSelect: function( data, tool ) {
		return function() {
			data.toolbox[ tool ] = $( this ).val()
			// x( tool + ',' + $( this ).val() );
			switch( $( this ).val() ) {
				case 'green': data.$canvas.removeClass( 'red erase' ).addClass( 'green' ); break;
				case 'red': data.$canvas.removeClass( 'green erase' ).addClass( 'red' ); break;
				case 'erase': data.$canvas.removeClass( 'red green' ).addClass( 'erase' ); break;
			}
		}
	}
,	log: function( msg ) {
		if( console && console.log ) {
			console.log( msg );
		}
	}
,	isInitialized: function( data ) {
		return ( typeof data === 'object' && data !== null );
	}
,	drawLine: function( x1, y1, x2, y2, data ) {
		/*!
		The equation of a straight line: (y - y1)/(y2 - y1) = (x - x1)/(x2 - x1)
		http://www.cut-the-knot.org/Curriculum/Calculus/StraightLine.shtml
		/**/
		/*! If the slope is < 45 degrees (if the angle is closer to the horizontal => the distance between the X's is greater) */
		if ( Math.abs( x1 - x2 ) > Math.abs( y1 - y2 ) ) {
			var xmin = Math.min( x1, x2 );
			var xmax = Math.max( x1, x2 );
			for( var i = xmin; i <= xmax; ++i ) {
				if ( x1 === x2 ) {
					_y = y1;
				} else {
					_y = Math.round( ( ( i - x1 ) / ( x2 - x1 ) ) * ( y2 - y1 ) + y1 );
				}
				methods.canvasDraw( i, _y, data, data.$canvas[ 0 ], data.toolbox.size, data.toolbox.color );
			}
		} else {
			var ymin = Math.min( y1, y2 );
			var ymax = Math.max( y1, y2 );
			for( var i = ymin; i <= ymax; ++i ) {
				if ( y1 === y2 ) {
					_x = x1;
				} else {
					_x = Math.round( ( ( i - y1 ) / ( y2 - y1 ) ) * ( x2 - x1 ) + x1 );
				}
				methods.canvasDraw( _x, i, data, data.$canvas[ 0 ], data.toolbox.size, data.toolbox.color );
			}
		}
	}
}

$.fn.canvasDraw = function( mixed, arg ) {
	/*! If a public function has been called to return a value */
	if( public.single[ mixed ] !== undefined ) {
		var data = this.first().data( 'canvasDraw' );
		if ( ! methods.isInitialized( data ) ) {
			return methods.log( 'Plugin isn\'t initialized' );
		}
		return public.single[ mixed ].call( this, data );
	}
	return this.each( function() {
		var $img = $( this )
		,	data = $img.data( 'canvasDraw' )
		;
		
		/*! If a public chainable function has been called */
		if( public.chain[ mixed ] !== undefined ) {
			if ( ! methods.isInitialized( data ) ) {
				return methods.log( 'Plugin isn\'t initialized' );
			}
			public.chain[ mixed ].call( this, data, arg );
		}
		
		/*! If the plugin hasn't been initialized */
		if ( ! methods.isInitialized( data ) ) {
			var width = $img.width()
			,	height = $img.height()
			,	C = ( mixed !== undefined && mixed.C !== undefined ) ? mixed.C : 1000
			;
			$img.data( 'canvasDraw', data = {
				blocks: []
			,	$canvas: $( '<canvas width="'+width+'" height="'+height+'" />' ).css( 'opacity', '0.5' )
			,	$span_relative: $( '<div />', { style: 'position: relative;' } )
			,	$span_absolute: $( '<span />', { style: 'position: absolute; top: 0; left: 0;' } )
			,	$span_toolbar: $( '<span />' )
			,	block_size: Math.floor( Math.sqrt( width * height / C ) )
			,	toolbox: {}
			} );
			data.stride = Math.ceil( width / data.block_size );
			data.arrayHeight = Math.ceil( height / data.block_size );
			
			/*! The canvas shares the data object with the image */
			data.$canvas.data( 'canvasDraw', data );
			
			/*! Insert a span with relative positioning before the IMG */
			$img.before( data.$span_relative );
			/*! Move the IMG inside that span */
			data.$span_relative.append( $img );
			/*! Add to that span another span with absolute positioning */
			data.$span_relative.append( data.$span_absolute );
			/*! Add the canvas inside the span with absolute positioning */
			data.$span_absolute.append( data.$canvas );
			
			/*! Add the event listener */
			data.$canvas.click( methods.canvasClick );
			data.$canvas.mousemove( methods.canvasDrag );
			data.$canvas.mousedown( function() { data.toolbox.drag = true; } );
			data.$canvas.mouseup( methods.canvasDragStop( data ) );
			data.$canvas.mouseout( methods.canvasDragStop( data ) );
			
			/*! Building the toolbar */
			var tools = {
				'size': { 'small': 0, 'medium': 1, 'large': 2 }
			,	'color': { 'green': 0, 'red': 1, 'erase': 2 }
			};
			var rand = Math.random();
			for( var tool in tools ) {
				var $div = $( '<div />' );
				for( var type in tools[ tool ] ) {
					var $tool = $( '<input type="radio" id="' +tool+type+rand+ '" name="' +tool+rand+ '" value="' +type+ '" />' );
					$div.append( $tool ).append( $( '<label for="' +tool+type+rand+ '">' +type+ '</label>' ) );
					$tool.data( 'canvasDraw', data ).click( methods.toolSelect( data, tool ) );
				}
				data.$span_toolbar.append( $div.buttonset() );
			}
			data.$span_relative.append( '<br />' );
			data.$span_relative.append( data.$span_toolbar );
			
			/*! Set the default values */
			$( 'input[name="color' +rand+ '"]:first' ).click();
			$( 'input[name="size' +rand+ '"]:first' ).click();
		}
	} );
};

} )( jQuery );