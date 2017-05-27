application.controller('ToastController', ['$scope', '$mdToast', 'toastParams', function($scope, $mdToast, toastParams){
	$scope.toast = toastParams;

	$scope.closeToast = function() {
		$mdToast.hide();
	}
}]);

application.controller('NotificationController', ['$scope', '$mdToast', 'notificationParams', function($scope, $mdToast, notificationParams){
	$scope.notification = notificationParams;

	$scope.closeToast = function() {
		$mdToast.hide();
	}
}]);

application.controller('HomeController', ['$scope', 'AppService', function($scope, AppService){
	$scope.appData.current_tab = 'home';
	$scope.appsInfo = angular.copy(application.constants.apps);

	$scope.goToApplicationPage = function(id) {
		AppService.goToApplicationPage(id);
	}
}]);

application.controller('ApplicationsController', ['$scope', function($scope){
	$scope.appData.current_tab = 'apps';
	$scope.appsInfo = angular.copy(application.constants.apps);
}]);

application.controller('ConsoleController', ['$scope', '$state', 'AppService', function($scope, $state, AppService){
	$scope.appData.current_tab = 'console';

	$scope.console = {
		tabs: [{
			id: 'users',
			name: 'Users',
		},{
			id: 'crew',
			name: 'Crew'
		},{
			id: 'query',
			name: 'Query'
		},{
			id: 'firebase',
			name: 'Firebase'
		}]
	};

	var tabState = 'console.tab';
	var tabId =  $state.params.tab;
	var params = $state.params.id;
	$scope.console.currentTab = 'users';

	var setTabState = function(tabId) {
		AppService.goToState(tabState, {tab: tabId, id:  null});
	}

	if(angular.isUndefined(tabId)) {
		tabId = $scope.console.currentTab;
		setTabState(tabId);
	}

	$scope.console.onTabSelect = function(tab) {
		$scope.console.currentTab = tab.id;
		setTabState(tab.id)
	}

	$scope.grantAdminPrevilages = function() {
		$scope.appData.user.permission = $scope.globals.permissions.ADMIN;
	}
}]);

application.controller('ConsoleTabController', ['$scope', '$rootScope', '$state', '$mdDialog', 'AppService', 'FirebaseService', 'FirebaseAPIService', function($scope, $rootScope, $state, $mdDialog, AppService, FirebaseService, FirebaseAPIService){
	var currentState = $state.current.name;
	var tabId =  $state.params.tab;
	var params = $state.params.id;

	$scope.console.currentTab = tabId;
	$scope.$parent.viewHtml = $scope.globals.html.views + 'console-' + tabId +'.html';

	var setParams = function(param) {
		AppService.goToState(currentState, {id: param}, false, false);
	}

	var openUserModal = function(userInfo) {
		AppService.openUserModel(userInfo, $scope.appData.user.permission, currentState, {tab: tabId, id: null});
	}

	var openCrewModal = function(title, crewInfo) {
		AppService.openCrewModal(title, crewInfo, $scope.appData.user.permission, currentState, {tab: tabId, id: null});
	}

	var openQueryModal = function(queryInfo) {
		AppService.openQueryModal(queryInfo, $scope.appData.user.permission, currentState, {tab: tabId, id: null})
	}


	var setUsersTabData = function() {
		if(params) {
			try{
				FirebaseService.getUserInfo(params, function(userInfo) {
					if(userInfo == null) {
						AppService.showNotFound();
					}
					openUserModal(userInfo);
				})
				
			} catch(e) {
				AppService.goToState(currentState, {tab: tabId, id:  null});
			}
		}

		FirebaseService.getAllUsers(function(users) {
			$scope.console.admins = _.filter(users, function(user, userId) {
	    		return user.permission == $scope.globals.permissions.ADMIN;
	    	});

	    	$scope.console.managers = _.filter(users, function(user, userId) {
	    		return user.permission == $scope.globals.permissions.MANAGER;
	    	});

	    	$scope.console.bloggers = _.filter(users, function(user, userId) {
	    		return user.permission == $scope.globals.permissions.BLOGGER;
	    	});

	    	$scope.console.users = _.filter(users, function(user, userId) {
	    		return user.permission == $scope.globals.permissions.USER;
	    	});
	    	_.defer(function(){$scope.$apply();});
		});
	}

	var setCrewTabData = function() {
		if(params) {
			try{
				FirebaseService.getCrewInfoFromURL(params, function(crewInfo){
					if(crewInfo == null) {
						AppService.showNotFound();
					}
					openCrewModal(crewInfo.name, crewInfo);
				})
			} catch(e) {
				AppService.goToState(currentState, {tab: tabId, id:  null});
			}
		}

		$scope.console.buttonLabel = "Add Crew";
		$scope.console.onButtonClick = function() {
			openCrewModal("Add Crew")
		};
		
		FirebaseService.getAllCrew(function(users) {
			$scope.console.fullTime = _.filter(users, function(user, userId) {
	    		return user.crewType == 'fullTime';
	    	});
	    	$scope.console.collaborators = _.filter(users, function(user, userId) {
	    		return user.crewType == 'collaborator';
	    	});
			_.defer(function(){$scope.$apply();});
		});
	}

	var setQueryTabData = function() {
		if(params) {
			try{
				FirebaseService.getQuery(params, function(queryInfo){
					if(queryInfo == null) {
						AppService.showNotFound();
					}
					openQueryModal(queryInfo);
				})
			} catch(e) {
				AppService.goToState(currentState, {tab: tabId, id:  null});
			}
		}
		FirebaseService.getUnAttendedQueries(function(queries) {
			$scope.console.userQuery = _.filter(queries, function(query) {
				return query.uid;
			});
			$scope.console.visitorQuery = _.filter(queries, function(query) {
				return !query.uid;
			});
			_.defer(function(){$scope.$apply();});
		})

		FirebaseService.getAttendedQueries(function(queries) {
			$scope.console.attendedQuery = _.filter(queries, function(query) {
				return true;
			});
			_.defer(function(){$scope.$apply();});
		})
	}

	var setFirebaseTabData = function() {
		$scope.console.firebase = {
			operation: 'set'
		};
	}

	$scope.onUserSelect = function(userInfo) {
		openUserModal(userInfo)
		setParams(userInfo.uid);
	}

	$scope.onCrewSelect = function(crewInfo) {
		openCrewModal(crewInfo.name, crewInfo);
		setParams(crewInfo.crewURL);
	};

	$scope.onQuerySelect = function(queryInfo) {
		openQueryModal(queryInfo);
		setParams(queryInfo.id);
	}

	$scope.deleteQuery = function(queryId) {
		FirebaseService.deleteQuery(queryId);
	}

	$scope.onFirebaseSave = function() {
		var error = FirebaseService.addFirebaseData($scope.console.firebase.dataPoint, $scope.console.firebase.dataJSON, $scope.console.firebase.operation);
		if(error == null) {
			setFirebaseTabData();
		} else {
			window.alert(error);
		}
	}

	$rootScope.$on('$stateChangeStart', function() {
		$mdDialog.cancel();
	})

	$scope.$watch('appData.user', function(user) {
		if(angular.isDefined(user.name)) {
			$scope.console.buttonLabel = null;
			switch(tabId) {
				case 'users': setUsersTabData();
					break;
				case 'crew': setCrewTabData();
					break;
				case 'query': setQueryTabData();
					break;
				case 'firebase': setFirebaseTabData();
					break;
				default: AppService.showNotFound();
			}
		}
	})
}]);

application.controller('ProfileController', ['$scope', function($scope){
	$scope.appData.current_tab = 'profile';
}]);

application.controller('AboutController', ['$scope', 'AppService', 'FirebaseService', function($scope, AppService, FirebaseService){
	$scope.appData.current_tab = 'about';
	$scope.crewList = {};

	FirebaseService.getAllCrew(function(users) {
		$scope.crewList.fullTime = _.filter(users, function(user, userId) {
    		return user.crewType == 'fullTime';
    	});
    	$scope.crewList.collaborators = _.filter(users, function(user, userId) {
    		return user.crewType == 'collaborator';
    	});
		_.defer(function(){$scope.$apply();});
	});

	$scope.onCrewSelect = function(crewInfo) {
		AppService.goToCrewPage(crewInfo.crewURL);
	}
}]);

application.controller('ContactController', ['$scope', 'AppService', 'FirebaseService', function($scope, AppService, FirebaseService){
	$scope.appData.current_tab = 'contact';
	$scope.contacts = angular.copy(application.globals.contact);
	$scope.query = {};
	$scope.showForm = false;
	$scope.contacts.social = AppService.getSocialLinks();

	$scope.$watch('appData.user', function(user) {
		if(angular.isDefined(user.uid)) {
			$scope.query.name = user.name;
			$scope.query.email = user.email;
			$scope.query.uid = user.uid;
		}
		$scope.showForm = true;

		$scope.submitQuery = function() {
			$scope.query.date = new Date().getTime();
			FirebaseService.addQuery($scope.query, function(data) {
				AppService.showToast(data.message);
				if(data.status) {
					delete $scope.query.content;
					AppService.reloadState();
				}
			});		
		}
	})
}]);

application.controller('IncludeController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', 'GitHubService', function($scope, $state, $stateParams, AppService, FirebaseService, GitHubService){
	var type = $stateParams.type;
	var id = $stateParams.id;

	var goToApplication = function(id) {
		var appsInfo = angular.copy(application.constants.apps);
		var appInfo = _.find(appsInfo, function(appInfo) {
			return appInfo.id == id;
		})

		if(!appInfo || !appInfo.showPage || !appInfo.page) {
			AppService.showNotFound();
			return;
		}

		$scope.viewHtml = $scope.globals.html.views + appInfo.page;
		$scope.appInfo = appInfo;

		if(angular.isDefined(appInfo.development)) {
			if(angular.isDefined(appInfo.development.contributors)) {
				FirebaseService.getContributors(appInfo.development.contributors, function(data) {
					$scope.appInfo.contributorsList = data;
					_.defer(function(){$scope.$apply();});
				})
			}

			if(angular.isDefined(appInfo.development.git)) {
				GitHubService.getCommits(appInfo.development.git, 10, function(data) {
					$scope.appInfo.gitCommits = data;
					_.defer(function(){$scope.$apply();});
				})
			}
		}

		$scope.onCrewSelect = function(crewInfo) {
			AppService.goToCrewPage(crewInfo.crewURL);
		}
	}

	var goToCrew = function(id) {
		$scope.viewHtml = '/modules/views/crew-page.html';
		FirebaseService.getCompleteCrewData(id, function(crewData) {
			if(crewData == null) {
				AppService.showNotFound();
			}
			$scope.crewInfo = crewData;
			_.defer(function(){$scope.$apply();});
		})
	}

	switch(type) {
		case 'application': 
			$scope.appData.current_tab = 'apps';
			goToApplication(id);
			break;
		case 'crew': 
			$scope.appData.current_tab = null;
			goToCrew(id);
			break;
		default: AppService.showNotFound();
	}
}]);

application.controller('NotFoundController', ['$scope', '$stateParams', function($scope, $stateParams){
	$scope.url = $stateParams.url;
}]);