# ImageStudio jQuery plugin

Dependencies: 

* underscore.js 1.3.1+
* jQuery 1.7.1+ 
* jQuery UI 1.8.16+
* ImageResizer.js
* jquery.jcrop.js (for crop pane, if enabled)
* jquery.jcrop.preview.js (for crop pane, if enabled)
* jquery.overdraw.js (for object removal pane, if enabled)


### API listing
	
	$('obj').ImageStudio({url:'/image.jpg'}); 
    $('obj').ImageStudio('api').getStatus({'restoreSuspendedCommands':true, 'removeEditingConstraints':true, 'useEditingServer':false}) returns { url, path, query };
    $('obj').ImageStudio('api').setOptions({height:600});
    $('obj').ImageStudio('api').setOptions({url:'newimageurl.jpg'}); //Yes, you can switch images like this.. as long as you're not in the middle of cropping. That's not supported yet.
    $('obj').ImageStudio('api').getOptions();
    $('obj').ImageStudio('api').destroy();

## Usage

### Basic Initialization

This will initialize ImageStudio with the default pane set, and the default height (530px).

	$('.studioDiv').ImageStudio({
		url: 'red-leaf.jpg'
	});

The affected elements will be given the CSS class 'imagestudio' as well as any classes thay already have.

### Advanced Initialiazation

	var changeHandler = function(api){
		alert(api.getStatus().url);
	};
	var settings= { url: '/red-leaf.jpg', //The image URL to load for editing. 
        width: null, //To set the width of the area
        accordionWidth: 230,
        height: 530, //To constrain the height of the area.
        panes: ['rotateflip', 'crop', 'adjust', 'redeye', 'carve', 'effects', 'faces'], 
        editingServer: null, 
        onchange: changeHandler, //The callback to fire whenever an edit occurs.
        cropratios: [[0, "Custom"], ["current", "Current"], [4 / 3, "4:3"], [16 / 9, "16:9 (Widescreen)"], [3 / 2, "3:2"]]};
        };
     $('.studioDiv').ImageStudio(settings);


### Removal

Removes all DOM elements associated with the ImageStudio instance, and returns the div to an empty state.

	$('.studioDiv').ImageStudio('api').destroy();

### Querying image status

	$('.studioDiv').ImageStudio('api').getStatus({'restoreSuspendedCommands':true, 'removeEditingConstraints':true, 'useEditingServer':false});

Returns a { url, path, query } object, where 'url' and 'path' are strings, and query is an ImageResizer.Instructions instance;

### Updating and querying options

The following options can be adjusted at runtime:

* url
* width
* accordionWidth
* height
* onchange

All others can only be set during initialization. Options are applied 'over' the current set of options; no need to duplicate previous settings.


    //$('obj').ImageStudio('api').setOptions({height:600});
    //$('obj').ImageStudio('api').setOptions({url:'newimageurl.jpg'}); //Yes, you can switch images like this.
    //$('obj').ImageStudio('api').getOptions();

Note that .getOptions() allows you to access references to the image, image wrapper div and accordion. (.img, .imgDiv, .accordion). These names may change, as they are internal. 

### Default Settings

	var defaults = {
        url: null, //The image URL to load for editing. 
        width: null, //To set the width of the area
        accordionWidth: 230,
        height: 530, //To constrain the height of the area.
        panes: ['rotateflip', 'crop', 'adjust', 'redeye', 'carve', 'effects', 'faces'], //A list of panes to display, in order. 
        editingServer: null, //If set, an alternate server will be used during editing. For example, using cloudfront during editing is counter productive
        editWithSemicolons: false, //If true, semicolon notation will be used with the editing server. 
        finalWithSemicolons: false, //If true, semicolons will be used in the final URLs. Defaults to true if the input URL uses semicolons.
        //A list of commands to temporarily remove from the URL during editing so that position-dependent operations aren't affected.
        //Any commands used by the editor should be in here also, such as 'cache', 'memcache', 'maxwidth',and 'maxheight'
        suspendKeys: ['width', 'height', 'maxwidth', 'maxheight',
                       'scale', 'rotate', 'flip', 'anchor',
                       'paddingwidth', 'paddingcolor', 'borderwidth', 'bordercolor', 'margin',
                       'cache', 'scache', 'process', 'shadowwidth', 'shadowcolor', 'shadowoffset', 'mode'],
        editingCommands: { cache: 'no', scache: 'mem' },
        onchange: null, //The callback to fire whenever an edit occurs.
        cropratios: [[0, "Custom"], ["current", "Current"], [4 / 3, "4:3"], [16 / 9, "16:9 (Widescreen)"], [3 / 2, "3:2"]],
        cropPreview: { width: '175px', height: '175px', 'margin-left': '-15px' },
        icons: {
            rotateleft: 'arrowreturnthick-1-w',
            rotateright: 'arrowreturnthick-1-e',
            flipvertical: 'arrowthick-2-n-s',
            fliphorizontal: 'arrowthick-2-e-w',
            reset: 'cancel',
            autofix: 'image',
            blackwhite: 'image',
            sepia: 'image',
            negative: 'image'

        },
        labels: {
            pane_rotateflip: 'Rotate &amp; Flip',
            rotateleft: 'Rotate Left',
            rotateright: 'Rotate Right',
            flipvertical: 'Flip Vertical',
            fliphorizontal: 'Flip Horizontal',
            reset: 'Reset',
            pane_crop: 'Crop',
            aspectratio: 'Aspect Ratio',
            crop_crop: 'Crop',
            crop_modify: 'Modify Crop',
            crop_cancel: 'Cancel',
            crop_done: 'Done',
            pane_adjust: 'Adjust Image',
            autofix: 'Auto-Fix',
            contrast: 'Contrast',
            saturation: 'Saturation',
            brightness: 'Brightness',
            pane_effects: 'Effects &amp; Filters',
            blackwhite: 'Black & White',
            sepia: 'Sepia',
            negative: 'Negative',
            sharpen: 'Smart Sharpen',
            noiseremoval: 'Noise Removal',
            oilpainting: 'Oil Painting',
            posterize: 'Posterize',
            blur: 'Gaussian Blur',
            pane_redeye: 'Red-Eye Removal',
            redeye_auto: 'Auto-detect Eyes',
            redeye_start: 'Fix Red-Eye',
            redeye_preview: 'Toggle Preview',
            redeye_clear: 'Clear',
            pane_faces: "Face Selection",
            faces_auto: "Auto-detect Faces",
            faces_start: "Select Faces",
            faces_clear: "Clear",
            cancel: 'Cancel',
            done: 'Done',
            pane_carve: 'Object Removal',
            carve_start: 'Remove objects',
            carve_preview: 'Preview result'

        }
    };

### Additional notes

The `window.cachedJson` variable is used for cross-instance request caching.

