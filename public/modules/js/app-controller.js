application.controller('AppController', ['$scope', '$rootScope', '$state', '$stateParams', 'AppService', 'FirebaseService', function($scope, $rootScope, $state, $stateParams, AppService, FirebaseService){
	$scope.globals = angular.copy(application.globals);
	$scope.globals.p = angular.copy(application.permissions);
	$scope.globals.social = AppService.getSocialLinks();
	$scope.showNotifications = false;

	AppService.initialise($scope.globals);

	$('.body-container').click(function() {
		$scope.showNotifications = false;
		_.defer(function(){$scope.$apply();});
	});	

	$scope.appData = {
		tabs: angular.copy(application.constants.tabs),
		viewLoader: false,
		user: {
			p: $scope.globals.p.VISITOR
		}
	};
	
	var setTitle = function(title) {
		$('title').text(title);
	}

	$scope.mSize = function(mSize) {
		return AppService.mSize(mSize);
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
        AppService.customLogin();
    }

	$scope.login = function() {
		AppService.login();
    }

    $scope.customLogin = function() {
    	AppService.customLogin();
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
    		FirebaseService.fetchUserInfo(user, function(userInfo) {
    			$scope.appData.user = userInfo;
    			if(userInfo.t) {
    				$scope.globals.theme = userInfo.t;
    				AppService.setMaterialTheme(userInfo.t);
    			}
				AppService.backgroundLoader(false);
				AppService.showToast('Signed in as '+$scope.appData.user.n);
				_.defer(function(){$scope.$apply();});
    		})

			FirebaseService.getNewNotifications(user.uid, function(data) {
				$scope.notifications = _.filter(data, function(notification, nid) {
					notification.nid = nid;
		    		return true;
		    	});
				_.defer(function(){$scope.$apply();});
			});

			$scope.resendMail = function() {
				FirebaseService.sendEmailVerification(function(data) {
					AppService.showToast(data.message);
				})	
			}
		} else {
			AppService.backgroundLoader(false);
			$scope.appData.user = {
				p: $scope.globals.p.VISITOR
			};
		}
    })

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
    	if(toState.name != fromState.name) {
    		$scope.appData.viewLoader = true;
    	}
    });

    $scope.$on('$viewContentLoaded', function(event){
    	$scope.appData.viewLoader = false;
    });

   	$scope.$watch('appData.current_tab', function(newTab, oldTab) {	
		if(angular.isDefined(newTab) && newTab != oldTab) {
			var tab = _.find($scope.appData.tabs, function(tabData){
				return (tabData.id == newTab);
			})
			setTitle(tab.title);
		}
	})
}]);