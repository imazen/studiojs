
/*This software is MIT licensed.

Copyright (c) 2012 Imazen LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function ($) {

    //Polling methods
    //$('obj').ImageStudio('api').getStatus({'restoreSuspendedCommands':true, 'removeEditingConstraints':true, 'useEditingServer':false} ) returns { url, path, query };
    //$('obj').ImageStudio('api').setOptions({height:600});
    //$('obj').ImageStudio('api').setOptions({url:'newimageurl.jpg'}); //Yes, you can switch images like this.. as long as you're not in the middle of cropping. That's not supported yet.
    //$('obj').ImageStudio('api').getOptions();
    //$('obj').ImageStudio('api').destroy();
    //labels and icon values cannot be updated after initialization. 
    var defaults = {
        url: null, //The image URL to load for editing. 
        width: null, //To set the width of the area
        accordionWidth: 230,
        height: 560, //To constrain the height of the area.
        panes: ['rotateflip', 'crop', 'adjust', 'effects', 'redeye', 'carve', 'faces'], //A list of panes to display, in order. 
        editingServer: null, //If set, an alternate server will be used during editing. For example, using cloudfront during editing is counter productive
        editWithSemicolons: null, //If true, semicolon notation will be used with the editing server. 
        finalWithSemicolons: null, //If true, semicolons will be used in the final URLs. Defaults to true if the input URL uses semicolons.
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
            autowhite: 'image',
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
            autowhite: 'Auto-Balance',
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
    /* Coding style notes:
    Within each pane, a closure object name 'cl' is used to track state within the pane.
    Each pane function is passed a reference to the instance-wide options object, which can be used to modify the image URL, lock/unlock the accordion, etc.
    */

    $.fn.ImageStudio = function (options) {

        var processOptions = function (options) {
            var defs = $.extend(true, {}, defaults);
            if (options.labels) defs.labels = $.extend(true, defs.labels, options.labels);
            if (options.icons) defs.icons = $.extend(true, defs.icons, options.icons);
            return $.extend(defs, options);
        };

        var result = this;

        this.each(function () {
            var div = $(this);

            if (div.data('ImageStudio')) {
                // The API can be requested this way (undocumented)
                if (options == 'api') {
                    result = div.data('ImageStudio');
                    return;
                }
                // Otherwise, we just reset the options...
                else div.data('ImageStudio').setOptions(options);
            } else {
                div.data('ImageStudio', init(div, processOptions(options)));
            }
        });
        return result;
    };

    function init(div, opts) {
        div = $(div);
        div.empty();
        div.removeClass("imagestudio"); div.addClass("imagestudio");

        //UGH! a table. But the alternative is nasty cross-browser.
        var tr = $('<tr></tr>').appendTo($('<table></table>').css('width', '100%').appendTo(div));

        //Add accordion
        var atd = $('<td></td>').appendTo(tr);
        var a = $("<div></div>").addClass("controls").width(opts.accordionWidth).appendTo(atd);

        //Add image
        var itd = $('<td></td>').addClass("imageCell").css('vertical-align', 'middle').css('text-align', 'center').css('padding-left', '10px').css('padding-right', '10px').appendTo(tr);
        var idiv = $('<div></div>').css('text-align', 'center').appendTo(itd);
        var img = $('<img />').addClass("studioimage").appendTo(idiv);
        opts.img = img; //Save a reference to the image object in options
        opts.imgDiv = idiv;
        opts.container = div;
        opts.accordion = a;
        var updateOptions = function (changedOpts) {
            //Called by both init and setOptions.
            var o = changedOpts;
            //When init calls, 'changedOpts' and 'opts' reference the same object
            var isUpdate = (o != opts);
            //See if we can skip the URL update.
            var skipUrlUpdate = isUpdate && (!o.url || o.url == opts.url);
            //If we're updating the URL, see if we are using semicolons, and set appropriate properties
            if (!skipUrlUpdate && o.url.indexOf('?') < 0 && o.url.indexOf(';') > -1 && (o.finalWithSemicolons === undefined || o.finalWithSemicolons == null)) o.finalWithSemicolons = true;
            if (o.finalWithSemicolons && _.all([o.editWithSemicolons, o.editingServer, opts.editWithSemicolons, opts.editingServer], function (v) { return v === null || v === undefined; }))
                o.editWithSemicolons = true;

            //If this is an update, not an init, override old values with new ones.
            if (isUpdate) $.extend(opts, o);


            if (o.width) { div.width(o.width); }
            if (o.height) div.height(o.height);
            if (o.height) a.height(o.height);
            if (o.accordionWidth) { a.width(o.accordionWidth); atd.width(o.accordionWidth); }

            if (!skipUrlUpdate) {
                opts.original = ImageResizer.Utils.parseUrl(opts.url);
                opts.editPath = opts.original.path;
                if (opts.editingServer) opts.editPath = ImageResizer.Utils.changeServer(opts.editPath, opts.editingServer);

                opts.originalQuery = opts.original.obj;
                opts.filteredQuery = new ImageResizer.Instructions(opts.originalQuery);
                opts.suspendedItems = opts.filteredQuery.remove(opts.suspendKeys);
                var withConstraints = new ImageResizer.Instructions(opts.filteredQuery);
                withConstraints.maxwidth = div.width() - opts.accordionWidth - 30;
                withConstraints.maxheight = opts.height - 28;
                withConstraints.mergeWith(opts.editingCommands, true);

                opts.editQuery = withConstraints;
                opts.editUrl = opts.editPath + withConstraints.toQueryString(opts.editWithSemicolons);

                img.attr('src', opts.editUrl);
                //This event lets 'involved' panes like crop, object removal, faces, red-eye, etc. exit when we change the source image.
                img.triggerHandler('sourceImageChanged', [opts.url]);
                //This event keeps all sliders, toggles, etc in sync
                img.triggerHandler('query', [new ImageResizer.Instructions(opts.editUrl)]);
            }

        }; updateOptions(opts);

        //Add requested panes
        var panes = { 'rotateflip': addRotateFlipPane, 'crop': addCropPane, 'adjust': addAdjustPane, 'redeye': addRedEyePane, 'carve': addCarvePane, 'effects': addEffectsPane, 'faces': addFacesPane };
        for (var i = 0; i < opts.panes.length; i++) {
            a.append('<h3><a href="#">' + opts.labels['pane_' + opts.panes[i]] + '</a></h3>');
            a.append(panes[opts.panes[i]](opts));

        }
        //Activate accordion
        //Animated can be true, false or a string
        var animated = opts.animated && ((opts.animated.toLowerCase() === 'true') ? true : (opts.animated.toLowerCase() === 'false') ? false : opts.animated);
        a.accordion({ fillSpace: true, animated: animated});
        
        var api = {
            getOptions: function () { return opts; },
            setOptions: function (newOpts) {
                updateOptions(newOpts);
            },
            getStatus: function (params) {
                params = $.extend(params, { 'restoreSuspendedCommands': true, 'removeEditingConstraints': true, 'useEditingServer': false });
                var path = params.useEditingServer ? opts.editPath : opts.original.path;

                var q = new ImageResizer.Instructions(opts.editQuery);
                if (params.removeEditingConstraints) {
                    q.remove(opts.suspendKeys);
                }
                if (params.restoreSuspendedCommands) q.mergeWith(opts.suspendedItems);

                var url = params.useEditingServer ? q.toQueryString(opts.editWithSemicolons) : q.toQueryString(opts.finalWithSemicolons);
                return { url: path + url, query: q, path: path };
            },
            destroy: function () {
                div.data('ImageStudio', null);
                div.removeClass("imagestudio");
                div.empty();
            }
        };
        opts.api = api;
        return api;
    }
    //Because jquery's stupid ctor won't accept element arrays
    var $a = function (array) {
        var x = $();
        $.each(array, function (i, o) { x = x.add(o) });
        return x;
    };

    //Provides a callback to edit the querystring inside
    var edit = function (opts, callback) {
        opts.editQuery = new ImageResizer.Instructions(opts.editQuery);
        callback(opts.editQuery);
        opts.editUrl = opts.editPath + opts.editQuery.toQueryString(opts.editWithSemicolons);
        setloading(opts, true, true);
        opts.img.attr('src', opts.editUrl);
        if (opts.img.prop('complete')) setloading(opts, false);
        opts.img.triggerHandler('query', [opts.editQuery]);
        if (opts.onchange != null) opts.onchange(opts.api);
        //console.log(opts.editQuery);
    };
    var setUrl = function (opts, url, silent) {
        opts.editQuery = new ImageResizer.Instructions(url);
        opts.editUrl = url;
        setloading(opts, true, true);
        opts.img.attr('src', url);
        if (opts.img.prop('complete')) setloading(opts, false);
        if (!silent) {
            opts.img.triggerHandler('query', [new ImageResizer.Instructions(opts.editQuery)]);
            if (opts.onchange != null) opts.onchange(opts.api);
        }
    }
    //Makes a button that edits the image's querystring.
    var button = function (opts, id, editCallback, clickCallback) {
        var icon = opts.icons[id];
        var b = $('<button type="button"></button>').addClass('button_' + id).button({ label: opts.labels[id] ? opts.labels[id] : id, icons: icon != null ? { primary: "ui-icon-" + icon} : {} });
        if (editCallback) b.click(function () {
            edit(opts, function (obj) {
                editCallback(obj);
            });
        });

        if (clickCallback) b.click(clickCallback);
        return b;
    };
    var toggle = function (container, id, querystringKey, opts) {
        if (!window.uniqueId) window.uniqueId = (new Date()).getTime();
        window.uniqueId++;
        var chk = $('<input type="checkbox" id="' + window.uniqueId + '" />');
        chk.prop("checked", opts.editQuery.getBool(querystringKey));
        chk.appendTo(container);
        $('<label for="' + window.uniqueId + '">' + opts.labels[id] + '</label>').appendTo(container);
        chk.button({ icons: { primary: "ui-icon-" + opts.icons[id]} }).click(function () {
            edit(opts, function (obj) {
                obj.toggle(querystringKey);
            });
        });
        opts.img.bind('query', function (e, obj) {
            var b = obj.getBool(querystringKey);
            if (chk.prop("checked") != b) chk.prop("checked", b);
            chk.button('refresh');
        });
        return chk;
    };
    var slider = function (opts, min, max, step, key) {
        var supress = {};
        var startingValue = opts.editQuery[key]; if (startingValue == null) startingValue = 0;
        var s = $("<div></div>").slider({ min: min, max: max, step: step, value: startingValue,
            change: function (event, ui) {
                supress[key] = true;
                edit(opts, function (obj) {
                    obj[key] = ui.value;
                    if (key.charAt(0) == 'a') obj['a.radiusunits'] = 1000;
                    if (obj[key] === 0) delete obj[key];
                });
                supress[key] = false;
            }
        });
        opts.img.bind('query', function (e, obj) {
            if (supress[key]) return;
            var v = obj[key]; if (v == null) v = 0;
            if (v != s.slider('value')) {
                s.slider('value', v);
            }
        });
        return s;
    };
    var h3 = function (opts, id, container) {
        return $("<h3 />").text(opts.labels[id] ? opts.labels[id] : "text-not-set").addClass(id).appendTo(container);
    };

    var lockAccordion = function (opts, currentPaneDiv) {
        opts.accordion.accordion("disable");
        currentPaneDiv.removeClass("ui-state-disabled");
        currentPaneDiv.removeClass("ui-accordion-disabled");
        opts.accordion.removeClass("ui-state-disabled");
    };
    var freezeImage = function (opts) {
        opts.imgDiv.css('padding-left', (opts.imgDiv.width() - opts.img.width()) / 2 + 1);
        opts.imgDiv.css('text-align', 'left');
        opts.imgDiv.height(opts.img.height());
        opts.img.css('position', 'absolute');
    };
    var unFreezeImage = function (opts) {
        opts.img.attr('style', ''); //Remove the position-abosolute stuff.
        opts.imgDiv.css('padding-left', 0); //undo horizontal align fix
        opts.imgDiv.css('text-align', 'center');
        opts.imgDiv.css('height', 'auto');
    };
    var setloading = function (opts, loading, stopOnImageLoad) {
        if (!opts.imageLoadedHandler) {
            opts.imageLoadedHandler = function () {
                opts.container.removeClass('imagestudio-loading');
                opts.img.unbind('load', opts.imageLoadedHandler);
            };
        }

        opts.container.removeClass('imagestudio-loading');
        opts.img.unbind('load', opts.imageLoadedHandler);
        if (loading) {
            opts.container.addClass('imagestudio-loading');
            if (stopOnImageLoad) opts.img.bind('load', opts.imageLoadedHandler);
        }
    };

    //Adds a pane for rotating and flipping the source image
    var addRotateFlipPane = function (opts) {
        var c = $('<div></div>');
        button(opts, 'rotateleft', function (obj) { obj.increment("srotate", -90, 360); }).appendTo(c);
        button(opts, 'rotateright', function (obj) { obj.increment("srotate", 90, 360); }).appendTo(c);
        button(opts, 'flipvertical', function (obj) { obj.toggle("sflip.y"); }).appendTo(c);
        button(opts, 'fliphorizontal', function (obj) { obj.toggle("sflip.x"); }).appendTo(c);
        button(opts, 'reset', function (obj) { obj.resetSourceRotateFlip() }).appendTo(c);

        return c;
    };
    //contrast/saturation/brightness adjustment
    var addAdjustPane = function (opts) {
        var c = $('<div></div>');
        toggle(c, 'autowhite', "a.balancewhite", opts);
        h3(opts, 'contrast', c);
        c.append(slider(opts, -1, 1, 0.001, "s.contrast"));
        h3(opts, 'saturation', c);
        c.append(slider(opts, -1, 1, 0.001, "s.saturation"));
        h3(opts, 'brightness', c);
        c.append(slider(opts, -1, 1, 0.001, "s.brightness"));
        button(opts, 'reset', function (obj) {
            obj.remove("s.contrast", "s.saturation", "s.brightness", "a.balancewhite");
        }).appendTo(c);
        return c;
    };
    //Effects and noise removal
    var addEffectsPane = function (opts) {
        var c = $('<div></div>');
        toggle(c, 'blackwhite', "s.grayscale", opts);
        toggle(c, "sepia", "s.sepia", opts);
        toggle(c, "negative", "s.invert", opts);
        h3(opts, 'sharpen', c);
        c.append(slider(opts, 0, 15, 1, "a.sharpen"));
        h3(opts, 'noiseremoval', c);
        c.append(slider(opts, 0, 100, 1, "a.removenoise"));
        h3(opts, 'oilpainting', c);
        c.append(slider(opts, 0, 25, 1, "a.oilpainting"));
        h3(opts, 'posterize', c);
        c.append(slider(opts, 0, 255, 1, "a.posterize"));
        h3(opts, 'blur', c);
        c.append(slider(opts, 0, 40, 1, "a.blur"));
        button(opts, 'reset', function (obj) {
            obj.remove("a.sharpen", "a.removenoise", "a.oilpainting", "a.posterize", "s.grayscale", "s.sepia", "s.invert", "a.blur", "a.radiusunits");
        }).appendTo(c);
        return c;
    };



    //Object-remvoal (seam carving) pane
    var addCarvePane = function (opts) {
        var c = $('<div></div>');

        var cl = {};
        cl.img = opts.img;
        cl.opts = opts;

        var start = button(opts, 'carve_start', null, function () {
            reset.hide(); start.hide();
            lockAccordion(opts, c);
            var o = opts;
            var q = new ImageResizer.Instructions(o.editQuery);
            cl.packedData = o.editQuery["carve.data"];
            q.remove("carve.data");
            cl.baseUrl = o.editPath + q.toQueryString(o.editWithSemicolons);
            opts.img.attr('src', cl.baseUrl); //Undo current seam carving
            freezeImage(opts);
            var image = new Image();
            image.onload = function () {
                cl.w = image.width;
                cl.h = image.height;
                startCarve();
                cl.active = true;
            };
            image.src = cl.baseUrl;

        }).appendTo(c);

        var startCarve = function () {
            done.show();
            cancel.show();
            cl.img.canvasDraw({ C: 1000, controlParent: c });
            if (cl.packedData) cl.img.canvasDraw('unpack', cl.packedData);
        };
        var getFixedUrl = function () {
            var o = cl.opts;
            var q = new ImageResizer.Instructions(o.editQuery);
            q["carve.data"] = cl.packedData;
            return o.editPath + q.toQueryString(o.editWithSemicolons);
        }
        //Used for cancel, done buttons, and sourceImageChanged event.
        var stopDrawing = function (save, norestore) {
            cl.packedData = cl.img.canvasDraw('pack');
            cl.img.canvasDraw('unload');
            if (save)
                setUrl(opts, getFixedUrl(), false);
            else if (!norestore)
                cl.img.attr('src', opts.editUrl);
            done.hide();
            cancel.hide();
            start.show();
            reset.show();

            unFreezeImage(opts);
            opts.accordion.accordion("enable");
            cl.active = false;
        };

        var cancel = button(opts, 'cancel', null, function () { stopDrawing(false); }).appendTo(c).hide();
        var done = button(opts, 'done', null, function () { stopDrawing(true); }).appendTo(c).hide();
        //Just remove carve.data to reset everything!
        var reset = button(opts, 'reset', function (obj) { obj.remove("carve.data"); }).appendTo(c);
        //Handle source image changes by exiting
        opts.img.bind('sourceImageChanged', function () { if (cl.active) stopDrawing(false,true); });
        return c;
    };
    //Adds a pane for cropping
    var addCropPane = function (opts) {
        var c = $('<div></div>');
        //Pane-local closure
        var cl = { img: opts.img,
            cropping: false,
            jcrop_reference: null,
            previousUrl: null,
            opts: opts
        };

        //Called once the 'uncropped' image has been loaded and its dimensions determined
        var startCrop = function (uncroppedWidth, uncroppedHeight, uncroppedUrl, oldCrop) {
            //Use existing coords if present
            var coords = null;
            var cropObj = oldCrop;
            //Adjust for xunits/yunits
            if (cropObj && cropObj.allPresent()) coords = cropObj.stretchTo(uncroppedWidth, uncroppedHeight).toCoordsArray();


            //Handle preview init/update
            if (cl.opts.cropPreview) preview.JcropPreview({ jcropImg: cl.img });
            preview.hide();
            var update = function (coords) {
                if (cl.opts.cropPreview) {
                    preview.JcropPreviewUpdate(coords);
                    preview.show();
                }
            };

            cl.opts.imgDiv.css('padding-left', (cl.opts.imgDiv.width() - cl.img.width()) / 2 + 1);
            cl.opts.imgDiv.css('text-align', 'left');
            //Start up jCrop
            cl.img.Jcrop({
                onChange: update,
                onSelect: update,
                aspectRatio: getRatio(),
                bgColor: 'black',
                bgOpacity: 0.6
            }, function () {
                //Called when jCrop finishes loading
                cl.jcrop_reference = this;
                cl.opts.jcrop_reference = this;

                if (cl.opts.cropPreview) preview.JcropPreviewUpdate({ x: 0, y: 0, x2: uncroppedWidth, y2: uncroppedHeight, width: uncroppedWidth, height: uncroppedHeight });
                if (coords != null) this.setSelect(coords);

                //Show buttons
                $a([btnCancel, btnDone, label, ratio]).show();
                cl.cropping = true;
                setloading(opts, false);
            });

        }


        var stopCrop = function (save, norestore) {
            if (!cl.cropping) return;
            cl.cropping = false;
            if (save) {
                setUrl(cl.opts, cl.previousUrl, true);
                var coords = cl.jcrop_reference.tellSelect();
                edit(cl.opts, function (obj) {
                    obj.setCrop({ x1: coords.x, y1: coords.y, x2: coords.x2, y2: coords.y2, xunits: cl.img.width(), yunits: cl.img.height() });
                });
            } else if (!norestore) {
                setUrl(cl.opts, cl.previousUrl);
            }
            if (cl.jcrop_reference) {
                cl.jcrop_reference.destroy();
                delete cl.opts.jcrop_reference;
            }
            cl.img.attr('style', ''); //Needed to fix all the junk JCrop added.
            cl.opts.imgDiv.css('padding-left', 0); //undo horizontal align fix
            cl.opts.imgDiv.css('text-align', 'center');
            $a([btnCancel, btnDone, label, ratio, preview]).hide();
            $a([btnCrop, btnReset]).show();
            cl.opts.accordion.accordion("enable");
        }

        var btnCrop = button(opts, 'crop_crop', null, function () {

            setloading(opts, true, false);

            //Hide the reset and crop button, lock the accordion
            $a([btnReset, btnCrop]).hide();
            lockAccordion(opts, c);


            //Save the original crop values and URL
            var oldCrop = cl.opts.editQuery.getCrop();
            cl.previousUrl = opts.editUrl;

            //Create an uncropped URL
            var q = new ImageResizer.Instructions(cl.opts.editQuery);
            q.remove("crop", "cropxunits", "cropyunits");
            var uncroppedUrl = cl.opts.editPath + q.toQueryString(cl.opts.editWithSemicolons);


            var onLoadImage = function () {
                var image = new Image();
                image.onload = function () { startCrop(image.width, image.height, uncroppedUrl, oldCrop); };
                image.src = uncroppedUrl;
                cl.img.unbind('load', onLoadImage);
            };
            cl.img.attr('src', "");
            cl.img.bind('load', onLoadImage);
            //Switch to uncropped image
            cl.img.attr('src', uncroppedUrl);

        }).appendTo(c);
        //Set up aspect ratio checkbox
        var label = h3(opts, 'aspectratio', c).hide();
        var ratio = $("<select></select>");
        var getRatio = function () {
            return ratio.val() == "current" ? cl.img.width() / cl.img.height() : (ratio.val() == 0 ? null : ratio.val())
        };
        var ratios = opts.cropratios;
        for (var i = 0; i < ratios.length; i++)
            $('<option value="' + ratios[i][0].toString() + '">' + ratios[i][1] + '</option>').appendTo(ratio);
        ratio.appendTo(c).val(0).hide();
        ratio.change(function () {
            var r = getRatio();
            var coords = cl.jcrop_reference.tellSelect();
            cl.jcrop_reference.setOptions({ aspectRatio: r });
            var areAllEmpty = function (obj, keys) {
                for (var k in keys)
                    if (!isNaN(obj[keys[k]]) && obj[keys[k]] != 0) return false;
                return true;
            };
            if (areAllEmpty(coords, ['x', 'y', 'x2', 'y2'])) {
                if (r != 0 && r != cl.img.width() / cl.img.height()) {
                    cl.jcrop_reference.setSelect(ImageResizer.Utils.getRectOfRatio(r, cl.img.width(), cl.img.height()));
                } else cl.jcrop_reference.release();
            }
            cl.jcrop_reference.focus();
        });
        var grouper = $('<div></div>').addClass('crop-active-buttons').appendTo(c);
        var btnCancel = button(opts, 'crop_cancel', null, function () {
            stopCrop(false);
        }).appendTo(grouper).hide();
        //Handle source image changes by exiting
        opts.img.bind('sourceImageChanged', function () { if (cl.cropping) stopCrop(false, true); });

        var btnDone = button(opts, 'crop_done', null, function () {
            stopCrop(true);
        }).appendTo(grouper).hide();
        var preview = $("<div></div>").addClass('cropPreview').appendTo(c).hide();
        if (opts.cropPreview) preview.css(opts.cropPreview);
        var btnReset = button(opts, 'reset', function (obj) {
            stopCrop(false, true);
            obj.remove("crop", "cropxunits", "cropyunits");
        }).appendTo(c);


        //Update button label and 'undo' visib
        btnCrop.button("option", "label", opts.editQuery.crop ? opts.labels.crop_modify : opts.labels.crop_crop);
        btnReset.button({ disabled: !opts.editQuery.crop });
        cl.img.bind('query', function (e, obj) {
            btnCrop.button("option", "label", obj["crop"] ? opts.labels.crop_modify : opts.labels.crop_crop);
            btnReset.button({ disabled: !obj["crop"] });
        });

        return c;
    };

    var getCachedJson = function (url, done, fail) {
        if (window.cachedJson == null) window.cachedJson = {};
        var result = window.cachedJson[url];
        if (result != null) {
            done(result); return;
        } else {
            $.ajax({
                url: url,
                dataType: 'jsonp',
                success: function (data) {
                    window.cachedJson[url] = data;
                    done(data);
                },
                fail: function () {
                    fail();
                }
            });
        }
    };

    //Used for red-eye and face rectangle overlay management
    var RectOverlayMgr = function (opts, key, origWidthKey, origHeightKey) {
        this.opts = opts; this.img = opts.img; this.key = key; this.origWidthKey = origWidthKey; this.origHeightKey = origHeightKey;
        //Handle source image changes by exiting
        var cl = this;
        opts.img.bind('sourceImageChanged', function () { if (cl.active) cl.cancel(); });
    };
    var rp = RectOverlayMgr.prototype;
    rp.hide = function () {
        $(this.img).show();
        this.container.remove();
        this.enabled = false;
    };
    rp.addAuto = function () {
        this.addRects(this.info.features);
        this.hide();
        this.show();
    };
    rp.clear = function () {
        this.rects = [];
        this.hide();
        this.show();
    };
    rp.togglePreview = function () {
        if (this.enabled) {
            //Apply or remove 
            this.img.attr('src', this.getFixedUrl());
            this.hide();
        } else {
            this.img.attr('src', this.baseUrl);
            this.show();
        }
        return this.enabled;
    };
    rp.cancel = function () { this.exit(false); };
    rp.saveAndClose = function () { this.exit(true); };
    rp.reset = function () {
        var k = this.key;
        edit(this.opts, function (obj) {
            obj.remove(k);
        });
    };
    rp.getFixedUrl = function () {
        var q = new ImageResizer.Instructions(this.opts.editQuery);
        q.setRectArray(this.key, this.rects);
        q[this.origWidthKey] = this.info.ow;
        q[this.origHeightKey] = this.info.oh;
        return this.opts.editPath + q.toQueryString(this.opts.editWithSemicolons);
    };





    rp.exit = function (save) {
        this.hide();
        if (save)
            setUrl(this.opts, this.getFixedUrl(), false);
        else
            this.img.attr('src', this.opts.editUrl);
        unFreezeImage(this.opts);
        this.active = false;
        if (this.onExitComplete) this.onExitComplete(save);
    };

    rp.beginEnter = function () {

        var o = this.opts;
        setloading(o, true, false);
        var q = new ImageResizer.Instructions(o.editQuery);
        q.remove(this.key);
        this.baseUrl = o.editPath + q.toQueryString(o.editWithSemicolons);
        o.img.attr('src', this.baseUrl); //Undo current red-eye fixes
        this.jsonUrl = this.getJsonUrl(o.editPath, q);

        var cl = this;
        cl.loading = true;
        getCachedJson(this.jsonUrl, function (data) {
            if (cl.onEnterComplete) cl.onEnterComplete();
            cl.info = data;

            cl.rects = o.editQuery.getRectArray(cl.key);
            //Unless we already have rects, default to the automatic ones
            if (cl.rects.length == 0) cl.addRects(data.features);

            freezeImage(cl.opts);
            cl.show();
            setloading(cl.opts, false);
            cl.active = true;
        }, function () {
            setloading(cl.opts, false);
            cl.loading = false;
            if (cl.onEnterFail) cl.onEnterFail();
            cl.img.attr('src', o.editUrl);
        });
    };
    rp.hashrect = function (e) { return e.X + e.Y * 1000 + e.X2 * 100000 * e.Y2 * 1000000 };

    rp.addRects = function (rects) {
        if (rects == null || rects.length == 0) return;
        var cl = this;
        //merge with cl.rects, eliminating duplicates
        this.rects = _.uniq((this.rects ? this.rects : []).concat(cl.filterRects ? cl.filterRects(rects) : rects), false, cl.hashrect);
    };
    rp.addRect = function (rect, clientrect) {
        var cl = this;
        var d = cl.info;
        var cr = clientrect;
        var r = rect;
        if (cr == null) {
            cr = { x: (r.X - d.cropx) * (d.dw / d.cropw) - 1,
                y: (r.Y - d.cropy) * (d.dh / d.croph) - 1,
                w: (r.X2 - r.X) * (d.dw / d.cropw),
                h: (r.Y2 - r.Y) * (d.dh / d.croph)
            };
        } 2
        if (r == null) {
            var x = cr.x / (d.dw / d.cropw) + d.cropx;
            var y = cr.y / (d.dh / d.croph) + d.cropy;
            var w = cr.w / (d.dw / d.cropw);
            var h = cr.h / (d.dh / d.croph);
            r = { X: x, Y: y, X2: x + w, Y2: y + h, Accuracy: cr.accuracy };
            cl.rects.push(r);
        }
        //Don't add rectangle if it's out of bounds. silently keep it, in case we change the crop, though.
        if (cr.x < 0 || cr.y < 0 || cr.x + cr.w > cl.container.width() || cr.y + cr.h > cl.container.height()) return;

        var rect = $('<div></div>').addClass('red-eye-rect').width(cr.w).height(cr.h).css({ 'position': 'absolute', 'z-order': 2000 }).appendTo(cl.container).show().position({ my: 'left top', at: 'left top', collision: 'none', of: cl.container, offset: cr.x.toString() + ' ' + cr.y.toString() });
        rect.css('border', '1px solid green');
        rect.data('rect', r);
        var onClickRect = function () {
            var r = $(this).data('rect');
            $(this).remove();
            cl.rects = _.reject(cl.rects, function (val) { return cl.hashrect(val) == cl.hashrect(r) });
            cl.container.data('down', null);
        };

        rect.mouseup(onClickRect);
    };


    rp.show = function () {
        var cl = this;
        var d = cl.info;
        cl.enabled = true;

        cl.container = $('<div></div>').addClass('red-eye-container').css({ 'position': 'absolute', 'z-order': 1000 }).insertAfter(cl.img).show().position({ my: 'left top', at: 'left top', collision: 'none', of: cl.img, offset: '0 ' + d.dy }).width(d.dw).height(d.dh);
        $(cl.img).hide();
        $(cl.container).css({ 'backgroundImage': 'url(' + $(cl.img).attr('src') + ')' });
        for (var i = 0; i < cl.rects.length; i++) {
            cl.addRect(cl.rects[i]);
        }
        cl.container.mousedown(function (evt) {
            if (evt.which == 2) {
            }
            if (evt.which == 1) {
                if (typeof evt.offsetX === "undefined" || typeof evt.offsetY === "undefined") {
                    var targetOffset = $(evt.target).offset();
                    evt.offsetX = evt.pageX - targetOffset.left;
                    evt.offsetY = evt.pageY - targetOffset.top;
                }
                //var offset = $(this).offset();
                cl.container.data('down', { x: evt.offsetX, y: evt.offsetY });
                evt.preventDefault();
            }
        });

        cl.container.mouseup(function (evt) {
            if (typeof evt.offsetX === "undefined" || typeof evt.offsetY === "undefined") {
                var targetOffset = $(evt.target).offset();
                evt.offsetX = evt.pageX - targetOffset.left;
                evt.offsetY = evt.pageY - targetOffset.top;
            }

            if (cl.container[0] != this) return; //No bubbled events
            if (evt.which == 1) {
                var down = cl.container.data('down');
                if (down == null) return;
                cl.container.data('down', null);
                var cx = down.x;
                var cy = down.y;
                var cw = (evt.offsetX - cx);
                var ch = (evt.offsetY - cy);

                var accuracy = 9;
                if (cw < 0) { cx += cw; cw *= -1 };
                if (ch < 0) { cy += ch; ch *= -1 };
                if (cw + ch < 6) {
                    cx -= 12;
                    cy -= 12;
                    cw += 24;
                    ch += 24;
                    accuracy = 5;
                }
                cl.addRect(null, { x: cx, y: cy, w: cw, h: ch, accuracy: accuracy });
                $(document.body).focus();
            }
        });
    };

    var addFacesPane = function (opts) {
        var c = $('<div></div>');
        var mgr = new RectOverlayMgr(opts, 'f.rects', 'ow', 'oh');
        //Occurs after rect overlay system has exited.
        mgr.onExitComplete = function () {
            $a([done, cancel, clear, auto]).hide();
            $a([start, reset]).show();
            opts.accordion.accordion("enable");
        };
        //Occurs when data has been loaded and system is active
        mgr.onEnterComplete = function () {
            $a([done, cancel, clear, auto]).show();
        };
        mgr.onEnterFail = function () {
            $a([start, reset]).show();
            opts.accordion.accordion("enable");
        };
        mgr.getJsonUrl = function (basePath, baseQuery) {
            baseQuery['f.detect'] = true;
            return basePath + baseQuery.toQueryString(this.opts.editWithSemicolons);
        };

        var start = button(opts, 'faces_start', null, function () {
            $a([start, reset]).hide();
            lockAccordion(opts, c);
            mgr.beginEnter();
        }).appendTo(c);

        var auto = button(opts, 'faces_auto', null, function () { mgr.addAuto(); }).appendTo(c).hide();
        var clear = button(opts, 'faces_clear', null, function () { mgr.clear(); }).appendTo(c).hide();
        $('<br />').appendTo(c);

        var cancel = button(opts, 'cancel', null, function () { mgr.cancel(); }).appendTo(c).hide();
        var done = button(opts, 'done', null, function () { mgr.saveAndClose(); }).appendTo(c).hide();
        var reset = button(opts, 'reset', null, function () { mgr.reset(); }).appendTo(c);
        return c;
    };

    var addRedEyePane = function (opts) {
        var c = $('<div></div>');
        var mgr = new RectOverlayMgr(opts, 'r.eyes', 'ow', 'oh');
        //Occurs after rect overlay system has exited.
        mgr.onExitComplete = function () {
            $a([done, cancel, preview, clear, auto]).hide();
            $a([start, reset]).show();
            opts.accordion.accordion("enable");
        };
        //Occurs when data has been loaded and system is active
        mgr.onEnterComplete = function () {
            $a([done, cancel, preview, clear, auto]).show();
        };
        mgr.onEnterFail = function () {
            $a([start, reset]).show();
            opts.accordion.accordion("enable");
        };
        mgr.getJsonUrl = function (basePath, baseQuery) {
            baseQuery['r.detecteyes'] = true;
            return basePath + baseQuery.toQueryString(this.opts.editWithSemicolons);
        };
        mgr.filterRects = function (rects) {
            return _.reject(rects, function (e) { return e.Feature !== 0 });
        }

        var start = button(opts, 'redeye_start', null, function () {
            $a([start, reset]).hide();
            lockAccordion(opts, c);
            mgr.beginEnter();
        }).appendTo(c);

        var auto = button(opts, 'redeye_auto', null, function () { mgr.addAuto(); }).appendTo(c).hide();
        var clear = button(opts, 'redeye_clear', null, function () { mgr.clear(); }).appendTo(c).hide();
        $('<br />').appendTo(c);

        var preview = button(opts, 'redeye_preview', null, function () { $a([auto, clear, cancel, done]).toggle(); mgr.togglePreview(); }).appendTo(c).hide();
        var cancel = button(opts, 'cancel', null, function () { mgr.cancel(); }).appendTo(c).hide();
        var done = button(opts, 'done', null, function () { mgr.saveAndClose(); }).appendTo(c).hide();
        var reset = button(opts, 'reset', null, function () { mgr.reset(); }).appendTo(c);
        return c;
    };


})(jQuery);  
