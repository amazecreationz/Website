var loadJS = function(url, callback) {
	jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

//loadJS('/resources/js/angular.min.js')
//loadJS('/modules/js/amazecreationz.min.js')