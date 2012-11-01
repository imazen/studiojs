# Tutorial - Using StudioJS


### 1. Page doctype

To ensure consistent behavior across browsers, you MUST declare a doctype to prevent browsers from entering 'quirks mode'.


XHTML 1.0 Transitional 

	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">

HTML5

	<!DOCTYPE HTML>
	<html lang="en">



### 2. CSS Includes

StudioJS includes a lot of complicated UI elements. To ensure cross-browser consistency, it's important that you use a *css reset* prior to including any other stylesheets. We've provided one in the `css` directory, named `reset.css`.

Assuming you have copied the entire `css` folder into your project, you can place the following links inside `<head></head>`:

    <link href="css/reset.css" rel="Stylesheet" type="text/css" />
    <link href="css/ui-darkness/jquery-ui-1.9.1.custom.css" type="text/css" rel="Stylesheet" />	
	<link href="css/jquery.Jcrop.css" rel="stylesheet" type="text/css" /> 
    <link href="css/jquery.imagestudio.css" rel="stylesheet" type="text/css" /> 


You may use any version of jquery-ui you wish (although 1.8.16 or higher is reccomended), **but you must customize it to include at least the following elements**:

* UI Core (all)
* Accordion
* Button
* Slider


### 3. The placeholder element

All StudioJS needs to operate is a placeholder `<div>` somewhere on the page that is *NOT* floated. Note that z-order tweaks to the div or its parent may cause unexpected issues within child elements. If you place it in a dialog box, you may have to adjust the z-order.

	<div class="studio1" ></div>


### 4. Javascript includes

jQuery 1.7 or higher is required.
	
Includes can be placed in `<head>` or (for lazy loading) at the bottom of the `<body>` element (but within it). You must maintain the order of includes.

* jquery-ui must be after jquery
* ImageResizer.js must be after underscore
* jquery.jcrop must be after jquery
* jquery.jcrop.preview must be after jquery.jcrop
* jquery.overdraw.js must be after jquery
* jquery.imagestudio.js must be after everything else.


The following links assume that you have placed all javascript files (including jquery, underscore, and jquery-ui from /libs) in a 'js' folder.


    <script src="js/jquery-1.8.2.min.js" type="text/javascript"></script>
    <script src="js/underscore-min.js" type="text/javascript"></script>
    <script src="js/jquery-ui-1.9.1.custom.min.js" type="text/javascript"></script>
    <script src="js/ImageResizer.js" type="text/javascript"></script>
	<!-- jcrop is optional if you are not using the `crop` pane -->
    <script src="js/jquery.Jcrop.js" type="text/javascript"></script> 
    <script src="js/jquery.jcrop.preview.js" type="text/javascript"></script> 
    <!-- overdraw.js is optional if you are not using the 'remove objects' pane -->
    <script src="js/jquery.overdraw.js" type="text/javascript"></script>
    <script src="js/jquery.imagestudio.js" type="text/javascript"></script>


### 5. Initialization

You cannot intialize StudioJS until the page has loaded; and your method must be registered AFTER all of the javascript includes.


    <script type="text/javascript">
    //<!--
        $(function () {
            $('div.studio1').ImageStudio({ url: '/image.jpg?width=900' });
        });
    //-->
    </script>


### 6. You're done!

If an vanilla situation, in which you're using all the defaults and all the panes, your HTML will look something like this:


	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
	    <title>StudioJS Example</title>

	    <link href="css/reset.css" rel="Stylesheet" type="text/css" />
	    <link href="css/ui-darkness/jquery-ui-1.9.1.custom.css" type="text/css" rel="Stylesheet" />	
		<link href="css/jquery.Jcrop.css" rel="stylesheet" type="text/css" /> 
	    <link href="css/jquery.imagestudio.css" rel="stylesheet" type="text/css" /> 

	    <style type="text/css">
	        body{ background-color:Black;}
	    </style>
	</head>
	<body>

	    <div class="studio1" ></div>

	    <script src="js/jquery-1.8.2.min.js" type="text/javascript" ></script>
	    <script src="js/underscore-min.js" type="text/javascript" ></script>
	    <script src="js/query-ui-1.9.1.custom.min.js" type="text/javascript"></script>
	    <script src="js/jquery.Jcrop.js" type="text/javascript"></script> 
	    <script src="js/jquery.jcrop.preview.js" type="text/javascript"></script> 
	    <script src="js/ImageResizer.js" type="text/javascript"></script>
	    <script src="js/jquery.overdraw.js" type="text/javascript"></script>
	    <script src="js/jquery.imagestudio.js" type="text/javascript"></script>
	    <script type="text/javascript">
	    //<!--
	        $(function () {
	            $('div.studio1').ImageStudio({ url: '/image.jpg?width=900' });
	        });
	    //-->
	    </script>
	    
	</body>
	</html>


