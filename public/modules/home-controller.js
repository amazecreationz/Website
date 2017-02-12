amazecreationz.home.controller('HomeController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
	var content = $state.current.name.split('.')[1];
	if(content){
		$('html, body').animate({
	        scrollTop: $("#"+content).offset().top
	    }, 1000);
	}
    
}]);
