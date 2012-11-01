# jcrop.preview

A tiny jQuery plugin to provide live previews for Jcrop
Init by calling on an empty div which you'd like to contain the preview.
You can specify a width and height using the defaultWidth and defaultHeight settings, although CSS width/height specified on the div take precedence.
Ex:
$("div.preview").JcropPreview({ jcropImg: $("img.primaryImage") });

After initializing the preview, then you can start up Jcrop. If you don't have any special onSelect event handling to do, call $("div.preview").JcropPreviewUpdateFn() to create a handler for the event:

Ex. 

	$("img.primaryImage").Jcrop({
    	onChange: $("div.preview").JcropPreviewUpdateFn(),
	    onSelect: $("div.preview").JcropPreviewUpdateFn()
    });

    //If you have a custom function, just call the update function directly from within it
    var div = $("div.preview")
    var update = function(coords){
    	//Custom stuff here
    	//Use a reference, not a selector. Speed is important, as this gets called on mousemoves
    	div.JcropPreviewUpdate(coords); 

	};
	("img.primaryImage").Jcrop({
    	onChange: update,
	    onSelect: update
    });


## License

This software is MIT licensed.

Copyright (c) 2012 Nathanael Jones

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
