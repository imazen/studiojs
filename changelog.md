# StudioJS Migration Notes

## 0.3 - Nov 1, 2012

This release makes some potentially breaking changes (although ones that are easily avoided). 

It also brings much more solid codebase, as extensive refactoring and code review has occured. 
Dozens of potential bugs and nice scenarios have been fixed; far more than those mentioned below.

### Potentially breaking changes

Renamed ImageResizing.js to ImageResizer.js, and ImageResizing.ResizeSettings to ImageResizer.Instructions. Aliases in place for compatibility, although filename *will* have to be changed.

Added new files

* /css/jquery.imagestudio.css
* /css/loading.gif
* /css/delete-rect.png

Added new icons keys: 

* autowhite:'image'

Added new labels: 

* autowhite:'Auto-Balance'
* pane_faces: "Face Selection"
* faces_auto: "Auto-detect Faces"
* faces_start: "Select Faces"
* faces_clear: "Clear"

Changed default settings:

* Height 530 -> 560
* Effects pane is now before Fix Red Eye pane.
* Crop Preview is now 175x175 instead of 200x200, as crop preview now utilizes its entire area.

### New features & bug fixes in ImageResizer.js

* Fixed bug in Utils.toBool - now able to parse non-lowercase values (Like "True", "False")
* Added better support for editWithSemicolons and finalWithSemicolons inference
* Constructor now supports empty initialization.
* .rotateFlipCoords now supports face AND redeye rectangles. And it's now chainable.
* .getEyeRects and .setEyeRects have been replaced with .getRectArray(key) and .setRectArray(key,rects) respectively.
* .setCrop is now chainable.
* .increment now defaults 'cycleLimit' to 360
* .toggle(key,defaultValue,deleteIfMatches) now properly supports 'defaultValue' and 'deleteIfMatches'. Also, deleteIfMatches inherits 'defaultValue' if unspecified.


### New features & bug fixes in ImageStudio

* Added new pane 'Faces', for face selection. 
* Extracted common functionality between redeye and faces into a RectOverlayMgr class.
* Removed auto-fix button from 'adjust' pane, replaced with 'auto-white' button.
* Several bug fixes in Crop and Crop Preview.
* Loading support - the parent div will be given the css class 'imagestudio-loading' while the UI is waiting on server operations. jquery.imagestudio.css provides an implementation of a loading animation
* Added support for visual hint on eye/face rectangle deletion. jquery.imagestudio.css provides example.
* Added support for changing the image URL while crop/object removal/redeye/faces panes are 'active'. 

## 0.2 Oct 26, 2012

jcrop preview: Added support for client-side resizing within crop pane

