amazecreationz.controller('LoginController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
	$(window).resize();
	$('title').html("Amaze Creationz | Login");
	$('.body-container').animate({scrollTop : 0}, 800);
	$scope.showLoader = true;

	$scope.signIn = function() {
		$scope.showLoader = true;
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
		firebase.auth().signInWithPopup(provider).then(function(result) {
		}).catch(function(error) {
	        if (error.code === 'auth/account-exists-with-different-credential') {
	        	alert('You have already signed up with a different auth provider for that email.');
	        } else {
	        	console.error(error);
	        }
        });
	}

	firebase.auth().onAuthStateChanged(function(user) {
    	if(user){
    		$state.go($stateParams.redirect)
    	}
    	else {
    		$scope.showLoader = false;
    	}
    })
}]);