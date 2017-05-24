application.controller('AppController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, AppService, FirebaseService){
	$scope.globals = angular.copy(application.globals);
	$scope.globals.permissions = angular.copy(application.permissions);

	$scope.appData = {
		tabs: angular.copy(application.constants.tabs),
		user: {
			permission: $scope.globals.permissions.VISITOR
		}
	};
	
	var setTitle = function(title) {
		$('title').text(title);
	}

	$scope.openSideMenu = function() {
		AppService.openSideMenu();
	}

	$scope.closeSideMenu = function() {
		AppService.closeSideMenu();
	}

	$scope.openTab = function(tab) {
		AppService.closeSideMenu();
		$state.go(tab.state, tab.stateParams , {reload: true});
	}

	$scope.showLogin = function(){
        AppService.showLogin();
    }

	$scope.login = function() {
		AppService.login();
    }

	$scope.signOut = function() {
		AppService.logout(function() {
			$scope.appData.user = {
				permission: $scope.globals.permissions.VISITOR
			};
		})
	}
	
	firebase.auth().onAuthStateChanged(function(user) {
    	if(user){
    		FirebaseService.fetchCurrentUserInfo(function(userInfo) {
				AppService.backgroundLoader(false);
				$scope.appData.user = userInfo;
				AppService.showToast('Signed in as '+$scope.appData.user.name);
			})
		} else {
			AppService.backgroundLoader(false);
		}
    })

   	$scope.$watch('appData.current_tab', function(value){	
		if(value) {
			var tab = _.find($scope.appData.tabs, function(tabData){
				return (tabData.id == value);
			})
			setTitle(tab.title);
		}
	})
}]);