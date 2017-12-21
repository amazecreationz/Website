application.filter('isEmpty', function() {
	return function(input, inverse) {
		if(!inverse) {
			inverse = false;
		}
		var output = _.isEmpty(input);
  	return output != inverse;
	}
})

application.filter('isDefined', function() {
  return function(input, inverse) {
    if(!inverse) {
      inverse = false;
    }
    var output = angular.isDefined(input);
    return output != inverse;
  }
})

application.filter('permission', function() {
	return function(input, permission) {
    	var output = _.filter(input, function(user, userId) {
    		return user.p == permission;
    	});
    	return output
  	}
})