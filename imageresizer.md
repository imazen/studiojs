# ImageResizer.js

`Requires: jQuery 1.7.1+, underscore.js 1.3.1+`

This library provides classes and utility methods for manipulating ImageResizer command querystrings.

Most commands are straightforward parsing and serialization, but certain adjustments (such as rotation and flipping) require coordinate translation for crop, face, and eye selection rectangles. 

To reiterate, use .toggle and .increment for adjusting rotation or flipping values, if you want to preserve crop/eye/face coordinates.

Example:

	var i = new ImageResizer.Instructions();
	i.setCrop({x1:5,y1:5,x2:50,y2:50,xunits:100,yunits:100});
	i.toggle("sflip.x");
	i.toggle("sflip.y");
	i.toggle("flip.x");
	i.toggle("flip.y");
	i.incrememnt("srotate",90);
	i.getCrop();

## ImageResizer.Instructions class

### new ImageResizer.Instructions(obj);

Returns a new Instructions instance based on all the key/value pairs contained in 'obj'.

### new ImageResizer.Instructions(url);

Returns a new Instructions instance based on the querystring found in the given URL.

### .mergeWith(addition, overwrite=false)

Adds all key/value pairs in `addition` to the current instance. If `overwrite` = true, existing items will be overwritten instead of skipped.

Returns current instance.

Example:

	i.mergeWith({width:100,height:200,mode:'crop'})

### .toQueryString(useSemicolons=false)

Returns a URI-ready querystring, including the leading '?' or ';'. If `useSemicolons` is true, the quersytring is returned in the `;width=100;height=200` form instead of '?width=100&height=200' form.

### .remove(arrayOfKeys)

Removes each key specified in the given array from the current instance. Returns a new Instructions instance containing all the deleted pairs.

### .remove(key1,key2,key3,...)

Removes each key specified in the argument list from the current instance. Returns a new Instructions instance containing all the deleted pairs.

### .normalize()

Lowercases all keys. 

Merges the following key aliases 

* thumbnail -> format
* srcflip -> sflip
* w -> width
* h -> height
* r.ih -> oh
* r.iw -> ow

Returns self. Automatically called after parsing, but not after mergeWith

### .undup(primaryKey,secondaryKey)

Unduplicates keys, deleting secondaryKey. If primaryKey has a non-null, non-empty value, it is retained and secondaryKey is deleted. Otherwise the value from secondaryKey is moved to primaryKey.

returns self

### .getBool(key)

Returns a true/false value from the given key.

### .getRectArray(key)

Returns an array of rectangle objects {X,Y,X2,Y2,Accuracy} from the given key of comma-delimited values. Used for Faces and RedEye data.

### .setRectArray(key, rects)

Serializes the given array of rectangle objects {X,Y,X2,Y2,Accuracy} to the given key. Used for Faces and RedEye data.

Returns self.

### .toggle(key, defaultValue=false, deleteIfMatches=false)

If 'defaultValue' is specified, but not 'deleteIfMatches', 'deleteIfMatches' will inherit the value from 'defaultValue'.

Toggles the given key between true and false. 

Thus, called for the first time on a non-existent key, with defaultValue="false", the final value would be 'true'.

Called again, the key would be deleted, as 'false' is the default value for deleteIfMatches.

If you don't want the key deleted when it has the default value, set 'deleteIfMatches' to null.

*Special handling for sflip.x,sflip.y,flip.x,flip.y*

This method accepts the aforementioned aliases to permit you to toggle horizontal and vertical flipping independently. defaultValue is not supported with these keys. deleteIfMatches defaults to "00" here.

Also, calles rotateFlipCoords as needed to preserve affected coordinates.


###.increment(key,offset,cycleLimit=360,defaultValue=0)

Increments the given number (specified by 'key') by the specified offset. Ensures the value never exceeds positive or negative cycleLimit, using modulus. 

Calls rotateFlipCoords to preserve coordinates when used with 'srotate'.


### .getCrop()

Returns a CropRectangle instance derived from the Instruction set.

### .setCrop(cropObj)

Updates the instruction instance values with the values from the given CropRectangle instance or object containing {x1,y1,x2,y2,xunits,yunits} members.


### .rotateFlipCoords(rot,fx,fy)

Crop rectangles, eye, and face selection coordinates are sensitive to rotation and flipping. To preserve them, we must translate the values each time we rotate or flip an image.

This method is used by resetSourceRotateFlip(), increment(), and toggle().

### .resetSourceRotateFlip()

Resets the values of sflip and srotate, preserving coordinate values.


## ImageResizer.CropRectangle class

Members {x1,y1,x2,y2,xunits,yunits}

### new ImageResizer.CropRectangle(obj)

Copies all members from 'obj' to self.

### .pullFrom(query)

Copies query.cropxunits, query.cropyunits and query.crop from the given Instructions instance.

### .pushTo(query)

Sets query.cropxunits, query.cropyunits, and query.crop from the current instance falles.


### .allPresent() 

Returns true if x1,y1,x2,y2, xunits, and yunits are set on the current instance.

### .stretchTo(width,height)

Returns a new CropRectangle instance with the values scaled to the given width and height. Assumes the previous xunits and yunits values represent the old width and height.

### toCoordsArray()

Returns an array containing [x1,y1,x2,y2]

## ImageResizer.Utils namespace

A collection of path/value parsing utilities.

### Utils.parseUrl(url)

Parses the given url and returns an object containing {path,obj,query}, where path is the URL minus the querystring, 'obj' is an Instructions instance, and 'query' is the querstring in string form.


### Utils.changeServer(url,newServer)

Replaces the scheme, host, and port in 'url' with the value from 'newServer'.

Returns the result URL string.

## Utils.joinPaths(base,relative)

Returns 'base' + 'relative', ensuring they are joined by a forward slash (/). 

### Utils.parseQuery(querystring, sep='&', eq='=')

Parses the given querystring into an object (leading character must already be removed).

### Utils.stringifyQuery(obj, sep='&', eq='=')

Serializes the given object into a querystring. 

### Utils.toBool(val,defaultValue=false)

Converts the given string into a boolean. If null or undefined, returns 'defaultValue'
"false","0", and "no" return 'false', all other strings return 'true'.

### Utils.parseFlip(value)

Parses the given combined flip string into an {x:0 or 1 ,y:0 or 1} object.

Accepts: 'both','xy','x','y','h','v','none'

Case-insensitive

### Utils.toggleFlip(originalValue,togglex,toggley)

Returns a new toogle value (xy,x,y, or none) based on the original value and booleans togglex and toggle y.


## Internal methods

### .getRectOfRatio (ratio, maxwidth, maxheight) 

### .flipRotatePoint (x, y, oldWidth, oldHeight, oldAngle, newAngle, oldFlipH, newFlipH, oldFlipV, newFlipV)
### .flipRotateRect(x1, y1, x2, y2, width, height, oldAngle, newAngle, oldFlipH, newFlipH, oldFlipV, newFlipV)
