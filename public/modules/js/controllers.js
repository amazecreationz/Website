application.controller('ToastController', ['$scope', '$mdToast', 'toastParams', function($scope, $mdToast, toastParams) {
	$scope.toast = toastParams;

	$scope.closeToast = function() {
		$mdToast.hide();
	}
}]);

application.controller('NotificationController', ['$scope', '$mdToast', 'notificationParams', function($scope, $mdToast, notificationParams) {
	$scope.notification = notificationParams;

	$scope.closeToast = function() {
		$mdToast.hide();
	}
}]);

application.controller('HomeController', ['$scope', 'AppService', function($scope, AppService) {
	$scope.appData.current_tab = 'home';
	$scope.appData.bgImage = 'laptop.jpg';
	$scope.appsInfo = angular.copy(application.constants.apps);

	$scope.goToApplicationPage = function(id) {
		AppService.goToApplicationPage(id);
	}
}]);

application.controller('ApplicationsController', ['$scope', 'AppService', function($scope,AppService) {
	$scope.appData.current_tab = 'apps';
	$scope.appsInfo = angular.copy(application.constants.apps);

	$scope.goToApplicationPage = function(id) {
		AppService.goToApplicationPage(id);
	}
}]);

application.controller('ConsoleController', ['$scope', '$state', 'AppService', function($scope, $state, AppService) {
	$scope.appData.current_tab = 'console';

	$scope.console = {
		tabs: [{
			id: 'users',
			name: 'Users',
		},{
			id: 'team',
			name: 'Team'
		},{
			id: 'query',
			name: 'Query'
		}/*,{
			id: 'firebase',
			name: 'Firebase'
		}*/]
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
		$scope.appData.user.p = $scope.globals.p.ADMIN;
	}
}]);

application.controller('ConsoleTabController', ['$scope', '$state', '$rootScope', '$mdDialog', 'AppService', 'FirebaseService', 'FirebaseAPIService', function($scope, $state, $rootScope, $mdDialog, AppService, FirebaseService, FirebaseAPIService) {
	var currentState = $state.current.name;
	var tabId =  $state.params.tab;
	var params = $state.params.id;
	var action = $state.params.action;

	$scope.console.currentTab = tabId;

	var userModalDismissCallback = function(data) {
		AppService.goToState(currentState, {id: null}, false, false);
	}

	var userModalCancelCallback = function(data) {
		if(data == 'ADD_TEAM') {
			AppService.goToState(currentState, {tab: 'team', action: data}, false, true);
		} else {
			AppService.goToState(currentState, {id: null}, false, false);
		}
	}

	var teamModalDismissCallback = function(data) {
		if(data.info != null) {
			FirebaseService.saveTeamInfo(data.uid, data.info);
		} else {
			FirebaseService.deleteTeamMember(data.uid);
		}
		AppService.goToState(currentState, {id: null}, false, false);
	}

	var teamModalCancelCallback = function(data) {
		AppService.goToState(currentState, {id: null}, false, false);
	}

	var setParams = function(param) {
		AppService.goToState(currentState, {id: param}, false, false);
	}

	var openUserModal = function(userInfo) {
		AppService.openUserModal(userInfo, $scope.appData.user.p, userModalDismissCallback, userModalCancelCallback);
	}

	var openTeamModal = function(title, info, param) {
		AppService.openTeamModal(title, info, param, $scope.appData.user.p, teamModalDismissCallback, teamModalCancelCallback);
	}

	var openQueryModal = function(queryInfo) {
		AppService.openQueryModal(queryInfo, $scope.appData.user.p, currentState, {tab: tabId, id: null})
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
	    		return user.p == $scope.globals.p.ADMIN;
	    	});

	    	$scope.console.managers = _.filter(users, function(user, userId) {
	    		return user.p == $scope.globals.p.MANAGER;
	    	});

	    	$scope.console.bloggers = _.filter(users, function(user, userId) {
	    		return user.p == $scope.globals.p.BLOGGER;
	    	});

	    	$scope.console.users = _.filter(users, function(user, userId) {
	    		return user.p == $scope.globals.p.VERIFIED_USER;
	    	});

	    	$scope.console.unv_users = _.filter(users, function(user, userId) {
	    		return user.p == $scope.globals.p.USER;
	    	});
	    	_.defer(function(){$scope.$apply();});
		});
	}

	var setTeamTabData = function() {
		if(params) {
			if(action == 'ADD_TEAM') {
				FirebaseService.getUserInfo(params, function(info) {
					if(info == null) {
						AppService.showNotFound();
					} else {
						openTeamModal(info.n, info, true);
					}
				});
			} else {
				try{
					FirebaseService.getTeamInfoFromURL(params, function(info){
						if(info == null) {
							AppService.showNotFound();
						} else {
							openTeamModal(info.n, info, false);
						}
					});
				} catch(e) {
					AppService.goToState(currentState, {tab: tabId, id:  null});
				}
			}
		}
		
		FirebaseService.getTeam(function(users) {
			$scope.console.eT = _.filter(users, function(user, userId) {
	    		return user.type == 'EMPLOYEE';
	    	});
	    	$scope.console.cT = _.filter(users, function(user, userId) {
	    		return user.type == 'CONTRIBUTOR';
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
			$scope.console.attendedQuery = queries;
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

	$scope.onTeamSelect = function(info) {
		openTeamModal(info.n, info);
		setParams(info.profileURL);
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
    });

	$scope.$watch('appData.user', function(user) {
		if(angular.isDefined(user.uid)) {
			switch(tabId) {
				case 'users': setUsersTabData();
					break;
				case 'team': setTeamTabData();
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

application.controller('ProfileController', ['$scope', '$state', 'AppService', 'FirebaseService', function($scope, $state, AppService, FirebaseService){
	$scope.appData.current_tab = 'profile';
	$scope.availableThemes = {"red":"#D32F2F","pink":"#C2185B","purple":"#7B1FA2","deep-purple":"#512DA8","indigo":"#303F9F","blue":"#1976D2","light-blue":"#0288D1","cyan":"#0097A7","teal":"#00796B","green":"#388E3C","light-green":"#689F38","lime":"#AFB42B","yellow":"#FBC02D","amber":"#FFA000","orange":"#F57C00","deep-orange":"#E64A19","brown":"#5D4037","grey":"#616161","blue-grey":"#455A64"};
	var currentState = $state.current.name;
	var action = $state.params.action;

	var modalDismissCallback = function(data) {

	}

	var modalCancelCallback = function(pURL) {
		AppService.goToState(currentState, {action: null}, false, false);
		if (pURL != null) {
			$scope.appData.user.pURL = pURL
			_.defer(function(){$scope.$apply();});
		}
	}

	var openEditProfileModal = function(userInfo, action) {
		AppService.openEditProfileModal(userInfo, action, $scope.globals.theme, modalDismissCallback, modalCancelCallback);
	}
	
	$scope.onThemeChange = function(theme) {
		$scope.globals.theme = theme;
		AppService.setMaterialTheme(theme);
		if(angular.isDefined($scope.appData.user.uid)) {
			FirebaseService.setTheme($scope.appData.user.uid, theme);
		}
	}

	$scope.getPermissionLabel = function(permission) {
		return AppService.getPermissionType(permission);
	}

	$scope.resendMail = function() {
		FirebaseService.sendEmailVerification(function(data) {
			AppService.showToast(data.message);
		})	
	}

	$scope.$watch('globals.theme', function(theme) {
		$scope.selectedTheme = theme;
	});

	$scope.$watch('appData.user', function(user) {
		if(angular.isDefined(user.uid)) {
			if(action) {
				openEditProfileModal(user, action);
			}

			$scope.changePicture = function() {
				AppService.goToState(currentState, {action: 'CHANGE_PICTURE'}, false, false);
				openEditProfileModal(user, 'CHANGE_PICTURE');
			}
			
			$scope.editProfile = function() {
				AppService.goToState(currentState, {action: 'EDIT_PROFILE'}, false, false);
				openEditProfileModal(user, 'EDIT_PROFILE');
			}
		}
	});
}]);

application.controller('AboutController', ['$scope', 'AppService', 'FirebaseService', function($scope, AppService, FirebaseService){
	$scope.appData.current_tab = 'about';
	$scope.infoList = {};

	FirebaseService.getTeam(function(users) {
		$scope.infoList.e = _.filter(users, function(user, userId) {
    		return user.type == 'EMPLOYEE';
    	});
    	$scope.infoList.c = _.filter(users, function(user, userId) {
    		return user.type == 'CONTRIBUTOR';
    	});
		_.defer(function(){$scope.$apply();});
	});
}]);

application.controller('ContactController', ['$scope', 'AppService', 'FirebaseService', function($scope, AppService, FirebaseService) {
	$scope.appData.current_tab = 'contact';
	$scope.contacts = angular.copy(application.globals.contact);
	$scope.showForm = false;
	$scope.contacts.social = AppService.getSocialLinks();

	$scope.$watch('appData.user', function(user) {
		$scope.query = {};
		if(angular.isDefined(user.uid)) {
			$scope.query.n = user.n;
			$scope.query.e = user.e;
			$scope.query.uid = user.uid;
		}
		$scope.showForm = true;

		$scope.submitQuery = function() {
			$scope.query.d = new Date().getTime();
			FirebaseService.addQuery($scope.query, function(data) {
				AppService.showToast(data.message);
				if(data.status) {
					delete $scope.query.c;
					AppService.reloadState();
				}
			});		
		}
	})
}]);

application.controller('SettingsController', ['$scope', 'AppService', 'FirebaseService', function($scope, AppService, FirebaseService) {
	$scope.appData.current_tab = 'settings';

	$scope.availableThemes = {"red":"#D32F2F","pink":"#C2185B","purple":"#7B1FA2","deep-purple":"#512DA8","indigo":"#303F9F","blue":"#1976D2","light-blue":"#0288D1","cyan":"#0097A7","teal":"#00796B","green":"#388E3C","light-green":"#689F38","lime":"#AFB42B","yellow":"#FBC02D","amber":"#FFA000","orange":"#F57C00","deep-orange":"#E64A19","brown":"#5D4037","grey":"#616161","blue-grey":"#455A64"};

	$scope.onThemeChange = function(theme) {
		$scope.globals.theme = theme;
		AppService.setMaterialTheme(theme);
		if(angular.isDefined($scope.appData.user.uid)) {
			FirebaseService.setTheme($scope.appData.user.uid, theme);
		}
	}

	$scope.$watch('globals.theme', function(theme) {
		$scope.selectedTheme = theme;
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

		$scope.appInfo = appInfo;
		if(angular.isDefined(appInfo.development)) {
			if(angular.isDefined(appInfo.development.contributors)) {
				FirebaseService.getContributors(appInfo.development.contributors, function(data) {
					$scope.appInfo.contributorsList = data;
					_.defer(function(){$scope.$apply();});
				})
			}

			if(angular.isDefined(appInfo.development.git)) {
				GitHubService.getCommits(appInfo.development.git, 6, function(data) {
					$scope.appInfo.gitCommits = data;
					_.defer(function(){$scope.$apply();});
				})
			}
		}
	}

	var showTeamMemberProfile = function(profileURL) {
		FirebaseService.getTeamProfile(profileURL, function(profile) {
			if(profile == null) {
				AppService.showNotFound();
			}
			$scope.profile = profile;
			_.defer(function(){$scope.$apply();});
		})
	}

	switch(type) {
		case 'application': 
			$scope.appData.current_tab = 'apps';
			goToApplication(id);
			break;
		case 'profile': 
			$scope.appData.current_tab = undefined;
			showTeamMemberProfile(id);
			break;
		default: AppService.showNotFound();
	}
}]);

application.controller('NotFoundController', ['$scope', '$stateParams', function($scope, $stateParams){
	$scope.url = $stateParams.url;
}]);