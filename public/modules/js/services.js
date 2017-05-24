application.service('AppService', function($state, $stateParams, $location, $mdToast, $mdSidenav, $mdDialog, FirebaseService) {
	var AppService = this;

	this.backgroundLoader = function(showLoader) {
		var loader = $('.loader-shadow');
		if(showLoader) {
			loader.removeClass('hide');
		} else {
			loader.addClass('hide');
		}
	}

	this.openSideMenu = function() {
		$mdSidenav('side-menu').open();
	}

	this.closeSideMenu = function() {
		$mdSidenav('side-menu').close();
	}

	this.showLogin = function() {
		this.openSideMenu();
	}

	this.openURLinNewTab = function(URL) {
		window.open(URL, '_blank');
	}

	this.showToast = function(message, timeout) {
		$mdToast.show({
			hideDelay: timeout || 2000,
			position: 'top right',
			toastClass: 'toast',
			locals:{ 
				toastParams: {
					message: message
				}
			},
			controller: 'ToastController',
			templateUrl: '/modules/templates/toast.html',
			parent: document.getElementsByClassName('body-container')
        });
	}

	this.login = function() {
		AppService.closeSideMenu();
		AppService.backgroundLoader(true);
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
		firebase.auth().signInWithPopup(provider);
	}

	this.logout = function(callback) {
		AppService.closeSideMenu();
		firebase.auth().signOut().then(function() {
			AppService.showToast('Signed out successfully');
			callback();
		}, function(error) {
		});
	}

	this.reloadState = function() {
		$state.reload();
	}

	this.goToState = function(state, stateParams, reload, notify) {
		reload = reload || false;
		notify = angular.isDefined(notify) ? notify : true;
		stateParams = stateParams ? stateParams : {};
		$state.go(state, stateParams, {reload: reload, notify: notify});
	}

	this.goToApplicationPage = function(id) {
		$state.go('view', {type: 'application', id: id});
	}

	this.goToCrewPage = function(id) {
		$state.go('view', {type: 'crew', id: id});
	}

	this.showNotFound = function() {
		$state.go('NotFound', {url: $location.path()});
	}

	this.getPermissionType = function(value) {
		var permissions = angular.copy(application.permissions);
		var permissionType;
		angular.forEach(permissions, function(permission, key) {
			if(value ==  permission) {
				permissionType = key;
			}
		})
		return permissionType;
	}

	this.openUserModel = function(userInfo, permission, state, stateParams) {
		$mdDialog.show({
			controller: 'UserModalController',
			templateUrl: application.globals.html.views + 'modal-user.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: true,
			locals: {
				dialogParams: {
					userInfo: userInfo,
					permission: permission
				}
			}
		}).then(function(dialogData) {
			AppService.goToState(state, stateParams, false, false);
		}, function() {
			AppService.goToState(state, stateParams, false, false);
		});
	}

	this.openCrewModal = function(title, crewInfo, permission, state, stateParams) {
		$mdDialog.show({
			controller: 'CrewModalController',
			templateUrl: application.globals.html.views + 'modal-crew.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: true,
			size: 'lg',
			locals: {
				dialogParams: {
					title: title,
					crewInfo: crewInfo,
					permission: permission
				}
			}
		}).then(function(dialogData) {
			FirebaseService.putCrewInfo(dialogData.uid, dialogData.crewInfo);
			AppService.goToState(state, stateParams, false, false);
		}, function() {
			AppService.goToState(state, stateParams, false, false);
		});
	}

	this.openQueryModal = function(queryInfo, permission, state, stateParams) {
		$mdDialog.show({
			controller: 'QueryModalController',
			templateUrl: application.globals.html.views + 'modal-query.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: true,
			size: 'lg',
			locals: {
				dialogParams: {
					queryInfo: queryInfo,
					permission: permission
				}
			}
		}).then(function(dialogData) {
			AppService.goToState(state, stateParams, false, false);
		}, function() {
			AppService.goToState(state, stateParams, false, false);
		});
	}
});

application.service('FirebaseService', function(FirebaseAPIService) {
	var db = firebase.database().ref();
	var FirebaseService = this;

	this.fetchCurrentUserInfo = function(callback) {
		firebase.auth().currentUser.getToken().then(function(token) {
			FirebaseAPIService.getWithAuth('/userLogin', token).then(function(data) {
				callback(data.data);
			});
		});
	}

	this.getCurrentUserID = function() {
		return firebase.auth().currentUser.uid;
	}

	this.setUserPermission = function(userId, permission) {
		db.child('users').child(userId).child('permission').set(permission);
	}

	this.addFirebaseData = function(dataPoint, dataJSON, operation) {
		if(angular.isUndefined(operation)) {
			operation = 'set';
		}
		try {
			dataJSON = JSON.parse(dataJSON);
			if(operation == 'set') {
				db.child(dataPoint).set(dataJSON);
			} else {
				db.child(dataPoint).push(dataJSON);
			}
		} catch(e) {
			return e;
		}
		return null;	
	}

	this.getUserInfo = function(userId, callback) {
		db.child('users').child(userId).once('value', function(data){
			callback(data.val());	
		});
	}

	this.getAllUsers = function(callback) {
		db.child('users').orderByChild('permission').limitToFirst(20).on('value', function(data){
			callback(data.val());	
		}, function(error) {
			callback(null);
		});
	}

	this.putCrewInfo = function(userId, crewInfo) {
		var isCrew = true;
		var updates = {}
		if(crewInfo == null) {
			isCrew = null;
		}
		delete crewInfo.$$hashKey;
		updates['crew/'+userId] = crewInfo;
	 	updates['users/'+userId+'/crew'] = isCrew;
		db.update(updates);
	}

	this.getCrewInfo = function(userId, callback) {
		db.child('crew').child(userId).once('value', function(data){
			callback(data.val());	
		});
	}

	this.getCrewInfoFromURL = function(crewURL, callback) {
		db.child('crew').orderByChild('crewURL').equalTo(crewURL).once('value', function(data){
			var crewInfo;
			if(data.val() != null) {
				crewInfo = _.find(data.val(), function(crewInfo, userId) {
					return crewInfo.crewURL == crewURL;
				})
			}
			callback(crewInfo);	
		});
	}

	this.getCrewInfo = function(param, callback) {
		FirebaseService.getCrewInfo(param, function(crewInfo) {
			if(crewInfo != null) {
				callback(crewInfo);
			}
		})

		FirebaseService.getCrewInfoFromURL(param, function(crewInfo) {
			if(crewInfo != null) {
				callback(crewInfo);
			}
		})
	}

	this.getCompleteCrewData = function(param, callback) {
		FirebaseService.getCrewInfoFromURL(param, callback);
	}

	this.getCrewExcludedUsers = function(callback) {
		db.child('users').orderByChild('crew').equalTo(null).limitToFirst(20).once('value', function(data){
			callback(data.val());	
		});
	}

	this.getAllCrew = function(callback) {
		db.child('crew').limitToFirst(20).on('value', function(data){
			callback(data.val());	
		});
	}

	this.getContributor = function(crewURL, callback) {
		FirebaseService.getCrewInfoFromURL(crewURL, function(crewInfo) {
			callback(null, crewInfo);
		})
	}

	this.getContributors = function(contributors, callback) {
		async.map(contributors, FirebaseService.getContributor, function(errors, contributorsList) {
			callback(contributorsList);
		})
	}

	this.addQuery = function(query, callback) {
		var querySuccessMessage = 'Query sent successfully.';
		var queryFailMessage = 'Unable to send query. Try again later.'
		var db_ref = db.child('query').child('amazecreationz');
		var key = db_ref.push().key;
		var userId = query.uid;
		var promise;
		query.history[key] = {
			date: query.date,
			content: query.content
		}

		if(angular.isDefined(userId)) {
			query.id = userId;
			promise = db_ref.child('users').child(userId).set(query);
		} else {
			if(angular.isUndefined(query.id)) {
				query.id = key;
			}	
			promise = db_ref.child('visitors').child(query.id).set(query);
		}

		promise.then(function() {
			callback({ status: true, message: querySuccessMessage});
		}).catch(function(error) {
			callback({ status: false, message: queryFailMessage});
		});
	}

	this.getQuery = function(userId, callback) {
		db.child('query').child('amazecreationz').child('users').child(userId).once('value', function(data) {
			callback(data.val());
		})
	} 

	this.getQueryByID = function(queryId, callback) {
		db.child('query').child('amazecreationz').child('users').child(queryId).once('value', function(data) {
			if(data.val() != null) {
				callback(data.val());
			}
		})

		db.child('query').child('amazecreationz').child('visitors').child(queryId).once('value', function(data) {
			if(data.val() != null) {
				callback(data.val());
			}
		})
	} 

	this.getAllUserQuery = function(callback) {
		db.child('query').child('amazecreationz').child('users').orderByChild('priority').limitToFirst(20).on('value', function(data) {
			callback(data.val());
		}, function(error) {
			callback(null);
		})
	}

	this.getAllVisitorQuery = function(callback) {
		db.child('query').child('amazecreationz').child('visitors').orderByChild('priority').limitToFirst(20).on('value', function(data) {
			callback(data.val());
		}, function(error) {
			callback(null);
		})
	}

	this.getAllQuery = function(callback) {
		db.child('query').child('amazecreationz').limitToFirst(50).on('value', function(data) {
			callback(data.val());
		}, function(error) {
			callback(null);
		})
	}
})

application.service('FirebaseAPIService', function($http) {
	var APIDomain = angular.copy(application.firebase.current.functionsDomain);
	var FirebaseAPIService = this;

	this.getAPIWithParams = function(API, params) {
		var paramsURL = '?';
		angular.forEach(params, function(value, key) {
			paramsURL += key+'='+value+'&';
		})
		paramsURL = paramsURL.substring(0, paramsURL.length - 1);
		return API + paramsURL;
	}

	this.get = function(API) {
		var APIUrl = APIDomain + API;
		return $http({
			method: 'GET',
            url: APIUrl,
            cache: true
        });
	}

	this.getWithAuth = function(API, authToken, params) {
		if(angular.isUndefined(params)) {
			params = {};
		}
		params.authToken = authToken;
		API = FirebaseAPIService.getAPIWithParams(API, params);
		return FirebaseAPIService.get(API);
	}
})


application.service('GitHubService', function($http) {
	var baseURL = 'https://api.github.com/repos/' +application.globals.developments.github+'/';
	var GitHubService = this;

	this.getCommits = function(repo, limitTo, callback) {
		if(limitTo == null) {
			limitTo = 5;
		}
		var apiURL = baseURL + repo + '/commits?per_page='+limitTo;
		$http({
			method: 'GET',
			url: apiURL,
			cache: true
		}).then(function(data) {
			var commits = [];
			angular.forEach(data.data, function(commitData) {
				var commitInfo = {
					message: commitData.commit.message,
					committer: commitData.commit.committer.name,
					url: commitData.html_url,
					date: commitData.commit.committer.date
				}
				commits.push(commitInfo);
			})
			callback(commits)
		}, function(error) {
			callback(null)
		})
	}

	this.getUserInfo = function(URL, callback) {
		$http({
			method: 'GET',
			url: URL,
			cache: true
		}).then(function(data) {
			var info = {
				name: data.data.name,
				email: data.data.email,
				image: data.data.avatar_url,
				followers: data.data.followers,
				url: data.data.html_url
			}
			callback(null, info);
		}, function(error) {
			callback(null, null)
		})
	}

	this.getContributors = function(repo, callback) {
		var apiURL = baseURL + repo + '/contributors';
		$http({
			method: 'GET',
			url: apiURL,
			cache: true
		}).then(function(data) {
			var contributors = [];
			angular.forEach(data.data, function(contributor) {
				contributors.push(contributor.url);
			})
			async.map(contributors, GitHubService.getUserInfo, function(errors, contributorsList) {
				callback(contributorsList);
			})
		}, function(error) {
			callback(null)
		})
	}
})