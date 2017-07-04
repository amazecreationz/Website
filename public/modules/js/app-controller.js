application.controller('AppController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, AppService, FirebaseService){
	$scope.globals = angular.copy(application.globals);
	$scope.globals.permissions = angular.copy(application.permissions);
	$scope.globals.social = AppService.getSocialLinks();
	$scope.showNotifications = false;

	AppService.initialise($scope.globals);

	$('.body-container').click(function() {
		$scope.showNotifications = false;
		_.defer(function(){$scope.$apply();});
	});	

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
		$scope.appData.current_tab = tab.id;
		$state.go(tab.state, tab.stateParams , {reload: true});
	}

	$scope.showLogin = function(){
        AppService.showLogin();
    }

	$scope.login = function() {
		AppService.login();
    }

	$scope.signOut = function() {
		AppService.logout();
	}

	$scope.openSettings = function() {
		$state.go('settings');
	}

	$scope.showNotificationsPopup = function(value) {
		AppService.hideToast();
		$scope.showNotifications = value ? true : !$scope.showNotifications;
	}

	$scope.dismissNotifications = function() {
		FirebaseService.dismissNotifications($scope.appData.user.uid, $scope.notifications);
	}

	AppService.loadStyle('font-awesome.min.css', true).then(function() {
		$scope.appData.loaded = {
			fontAwesome: true
		}		
	})

	firebase.messaging().onMessage(AppService.onNotification);
	
	firebase.auth().onAuthStateChanged(function(user) {
    	if(user){
    		FirebaseService.fetchCurrentUserInfo(function(userInfo) {
    			$scope.appData.user = userInfo;
    			if(userInfo.theme) {
    				$scope.globals.theme = userInfo.theme;
    				AppService.setMaterialTheme(userInfo.theme);
    			}
				AppService.backgroundLoader(false);
				AppService.showToast('Signed in as '+$scope.appData.user.name);
				FirebaseService.getNotificationAccess(userInfo.uid);
				_.defer(function(){$scope.$apply();});
			}, function(error) {
				console.error(error);
				AppService.backgroundLoader(false);
				$scope.appData.user = {
					permission: $scope.globals.permissions.VISITOR
				};
			})
			FirebaseService.getNewNotifications(user.uid, function(data) {
				$scope.notifications = _.filter(data, function(notification, nid) {
					notification.nid = nid;
		    		return true;
		    	});
				_.defer(function(){$scope.$apply();});
			});
		} else {
			AppService.backgroundLoader(false);
			$scope.appData.user = {
				permission: $scope.globals.permissions.VISITOR
			};
		}
    })

   	$scope.$watch('appData.current_tab', function(newTab, oldTab) {	
		if(angular.isDefined(newTab) && newTab != oldTab) {
			var tab = _.find($scope.appData.tabs, function(tabData){
				return (tabData.id == newTab);
			})
			setTitle(tab.title);
		}
	})
}]);