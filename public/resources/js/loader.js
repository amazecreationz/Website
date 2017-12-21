console.log("LOADER")

var staticServer = "https://static.amazecreationz.in";
var version = "latest";

var getJSLocation = function(script) {
	return staticServer + "/" + version + "/js/" + script;
}

var loadScript = function(script) {
	var scriptTag = document.createElement('script');
	scriptTag.src = script;
	scriptTag.setAttribute('async', false);
	document.head.appendChild(scriptTag);
}

var scripts = [
	"jquery.min.js",
	//"angular.min.js",
	"angular-animate.min.js",
	"angular-aria.min.js",
	"angular-material.min.js",
	"angular-messages.min.js",
	"angular-ui-router.min.js",
	"angular-sanitize.min.js",
	"underscore-min.js",
	"async.min.js"]

scripts.forEach(function(script) {
	script = getJSLocation(script);
	loadScript(script);
})

//loadScript('/resources/js/amazecreationz.min.js');

