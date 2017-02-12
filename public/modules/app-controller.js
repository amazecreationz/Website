amazecreationz.controller('MainController', ['$scope', '$rootScope', '$state', '$window', '$location', '$mdSidenav', function($scope, $rootScope, $state, $window, $location, $mdSidenav){
	amazecreationz.globals.isLive = $location.host() == 'amazecreationz.in' || $location.host() == 'www.amazecreationz.in' || $location.host() == 'amaze-creationz.firebaseapp.com';
	$scope.globals = {
		image: angular.copy(amazecreationz.globals.image),
		cookies: angular.copy(amazecreationz.globals.cookies),
		servers: amazecreationz.globals.isLive ? amazecreationz.globals.servers : amazecreationz.globals.localservers,
		loader: angular.copy(amazecreationz.globals.loader),
		theme: angular.copy(amazecreationz.globals.theme)
	}
	$('.button-collapse').sideNav({
  			menuWidth: 270,
	      	edge: 'left',
	      	closeOnClick: true,
	      	draggable: true
		}
	);
	$scope.tabs = angular.copy(amazecreationz.constants.mainTabs);
	$scope.appItems = angular.copy(amazecreationz.constants.apps);

	$rootScope.user_data = {
		permission: 5
	};

	$rootScope.status = {
		server_online: false
	};

	$scope.login = function() {
    	$state.go('login', {redirect: $state.current.name != 'home'? $state.current.name : 'apps'});
    }

	$scope.signOut = function() {
		firebase.auth().signOut().then(function() {
			Materialize.toast('Signed out successfully', 3000);
			$rootScope.user_data = {
				permission: 5
			};
			$scope.$apply();
		}, function(error) {
		  	Materialize.toast('Some error occured. Try again.', 3000);
		});
	}

	$scope.openNewTab = function(url) {
		$window.open(url, '_blank');
	}

	$scope.showNavBar = function() {
		$mdSidenav('side-nav').open();
	}

	$scope.closeNavBar = function() {
		$mdSidenav('side-nav').close();
	}

	$(document).scroll(function() {
		
	    if($(window).scrollTop()  > $(window).height()-100) {
	        $('#back-to-top').removeClass('hide');
	    }
	    else {
	    	$('#back-to-top').addClass('hide');
	    }
	});

	$scope.scrollToTop = function() {
		$('body,html').animate({scrollTop: 0}, 800);
	}

	firebase.auth().onAuthStateChanged(function(user) {
    	if(user){	
	    	$rootScope.user_data = {
				name: user.displayName,
				email: user.email,
				image: user.photoURL,
				uid: user.uid,
				is_email_verified: user.emailVerified,
				isAdmin: false,
				is_user_signed: true,
				permission: 4
			}
			_.defer(function(){$scope.$apply();});
			Materialize.toast('Signed in as '+$rootScope.user_data.name, 3000);
			var db_ref = firebase.database().ref('references').child(user.uid);
			var info = {
		      name: user.displayName,
			  nickname: user.displayName,
		      email: user.email,
		      image_url: user.photoURL,
			  uid: user.uid
		    }
			db_ref.on('value', function(data){
				if(!data.val()){
					db_ref.set(info);
					$rootScope.user_data.nickname = info.nickname;
				}
				else {
					$rootScope.user_data.nickname = data.val().nickname;	
				}
				_.defer(function(){$scope.$apply();});
				db_ref.off();
			});
			firebase.database().ref('isAdmin').on('value', function(data){
				if(data.val()){
					$rootScope.user_data.isAdmin = data.val();
					$rootScope.user_data.permission = 0;
					_.defer(function(){$scope.$apply();});
				}	
			});
			firebase.database().ref('status').on('value', function(data){
				$rootScope.status = data.val();
				_.defer(function(){$scope.$apply();});
			});   
		}
    })
}]);