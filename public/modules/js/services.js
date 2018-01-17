application.service('AppService', function($state, $rootScope, $stateParams, $http, $location, $compile, $mdToast, $mdSidenav, $mdDialog, $mdTheming, $mdThemingProvider, $mdMedia, FirebaseService) {
	var AppService = this;

	this.initialise = function(globals) {
		AppService.setMaterialTheme(globals.theme);
	}

	this.backgroundLoader = function(showLoader) {
		var loader = $('.loader-shadow');
		if(showLoader) {
			loader.removeClass('hidden');
		} else {
			loader.addClass('hidden');
		}
	}

	this.loadScript = function(script, isLocal) {
		if(isLocal) {
			script = application.globals.scripts + script;
		}
		return $.getScript(script);
	}

	this.loadStyle = function(style, isLocal) {
		if(isLocal) {
			style = application.globals.styles + style;
		}
		var promise = $http.get(style);
		promise.then(function() {
			$('<link>', {rel:'stylesheet', type:'text/css', 'href':style}).appendTo('head');
		})
		return promise;
	}

	this.setMaterialTheme = function(theme) {
		theme = theme.toLowerCase();
	  	$mdThemingProvider.theme(theme).primaryPalette(theme, {
			'default': '700',
	      	'hue-1': '300',
	      	'hue-2': '600',
	      	'hue-3': '900'
		}).accentPalette(theme, {
			'default': '50',
			'hue-1': '50',
	      	'hue-2': '50',
	      	'hue-3': '50'
		});
		$mdThemingProvider.setDefaultTheme(theme);
		$mdTheming.generateTheme(theme);
	}

	this.getSocialLinks = function() {
		var social = angular.copy(application.globals.social);
		var socialLinks = {};
		angular.forEach(social, function(link, type) {
			socialLinks[type] = "https://www."+type+".com/"+link;
		})
		return socialLinks;
	}

	this.mSize = function(mSize) {
		return $mdMedia(mSize);
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

	this.scrollTo = function(scrollTop, scrollTime) {
		$('.main-container').animate({
		    scrollTop: scrollTop - 59 || 0
		 }, scrollTime || 800);
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

	this.hideToast = function() {
		$mdToast.hide();
	}

	this.showNotification = function(message, timeout) {
		$mdToast.show({
			hideDelay: timeout || 5000,
			position: 'bottom right',
			toastClass: 'notification',
			locals:{ 
				notificationParams: message
			},
			controller: 'NotificationController',
			templateUrl: '/modules/templates/notification.html',
			parent: document.getElementsByClassName('body-container')
        });
	}

	this.onNotification = function(payload) {
		AppService.showNotification(payload.notification);
	}

	this.login = function() {
		AppService.closeSideMenu();
		AppService.backgroundLoader(true);
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
		firebase.auth().signInWithRedirect(provider).catch(function(error) {
			console.error(error)
			AppService.backgroundLoader(false);
			AppService.showToast(error.message);
		});
	}

	this.customLogin = function() {
		AppService.closeSideMenu();
		window.location.href = '/auth?redirect='+$location.url();
	}

	this.logout = function() {
		AppService.closeSideMenu();
		firebase.auth().signOut().then(function() {
			AppService.showToast('Signed out successfully');
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

	this.goToURL = function(url) {
		if(url.includes('appLogin')) {
			window.location.href = url;
		} else {
			$location.url(url);
		}
	}

	this.goToApplicationPage = function(id) {
		$state.go('view', {type: 'application', id: id});
	}

	this.viewProfile = function(id) {
		$state.go('view', {type: 'profile', id: id, tab: null, params: null});
	}

	this.showNotFound = function() {
		$state.go('error', {url: $location.absUrl()});
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

	this.openEditProfileModal = function(userInfo, action, theme, dismissCallback, cancelCallback) {
		$mdDialog.show({
			controller: 'EditProfileModalController',
			templateUrl: application.globals.html.views + 'modal-edit-profile.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: true,
			locals: {
				dialogParams: {
					userInfo: userInfo,
					action: action,
					theme: theme
				}
			}
		}).then(dismissCallback, cancelCallback);
	}

	this.openUserModal = function(userInfo, permission, dismissCallback, cancelCallback) {
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
		}).then(dismissCallback, cancelCallback);
	}

	this.openTeamModal = function(title, info, param, permission, dismissCallback, cancelCallback) {
		$mdDialog.show({
			controller: 'TeamModalController',
			templateUrl: application.globals.html.views + 'modal-team.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: true,
			size: 'lg',
			locals: {
				dialogParams: {
					title: title,
					info: info,
					param: param,
					permission: permission
				}
			}
		}).then(dismissCallback, cancelCallback);
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

application.service('FirebaseService', function($filter, FirebaseAPIService, MailingService) {
	var db = firebase.database().ref();
	var firestore = firebase.firestore();
	var storageRef = firebase.storage().ref();
	var usersRef = firestore.collection('USERS');
	var usersStorageRef = storageRef.child('USERS');
	var teamRef = firestore.collection('TEAM');
	var queryRef = firestore.collection('QUERY');
	var appDataRef = firestore.collection('APP_DATA');
	var serverQueueRef = db.child('SERVER_QUEUE')
	var notificationsRef = db.child('amazecreationz').child('notifications');
	var FirebaseService = this;

	this.getCurrentUserID = function() {
		return firebase.auth().currentUser.uid;
	}

	this.getCurrentUser = function() {
		return firebase.auth().currentUser;
	}

	this.getAppDataRef = function(userId, app) {
		return appDataRef.doc(userId).collection(app);
	}

	this.changeUserPicture = function(uid, image, callback) {
		usersStorageRef.child(uid).child('dp.jpg').put(image).then(function(snapshot) {
			var promises = [];
			promises.push(usersRef.doc(uid).update({
				pURL: snapshot.downloadURL
			}));
			promises.push(FirebaseService.getCurrentUser().updateProfile({
				photoURL: snapshot.downloadURL
			}));
			Promise.all(promises).then(function(data) {
				callback(snapshot.downloadURL);
			})
		}).catch(function(error) {
			callback(null);
		})
	}

	this.addToServerQueue = function(uid, app, content) {
		serverQueueRef.child(uid).child(app).set(content);
	}

	this.getNotificationAccess = function(userId) {
		firebase.messaging().requestPermission().then(function() {
		    FirebaseService.saveNotificationToken(userId);
		}).catch(function(error) {
		    console.error('Unable to get permission to notify.', error);
		});
	}

	this.saveNotificationToken = function(userId) {
		firebase.messaging().getToken().then(function(currentToken) {
			if (currentToken) {
				db.child('amazecreationz').child('notifications').child('tokens').child(userId).set(currentToken);
		    } else {
		      FirebaseService.getNotificationAccess(userId);
		    }
		}).catch(function(error) {
    		console.error('Unable to get messaging token.', error);
    	});
	}

	this.getAuthToken = function(callback) {
		firebase.auth().currentUser.getIdToken().then(function(token) {
			callback(token)
		});
	}

	this.sendEmailVerification = function(callback) {
		FirebaseService.getCurrentUser().sendEmailVerification().then(function() {
			callback({
				message: 'Verification mail sent.'
			})
		}).catch(function(error) {
			callback({
				message: 'Resend failed. Try again later.'
			})
		});
	}

	this.setUserInfo = function(user) {
		return usersRef.doc(user.uid).set(user);
	}

	this.fetchUserInfo = function(user, callback) {
		usersRef.doc(user.uid).get().then(function(doc) {
			var userInfo;
			if(!doc.exists) {
				userInfo = {
					n: user.displayName,
					e: user.email,
					pURL: user.photoURL  || application.globals.logo,
					p: application.permissions.USER
				}
				if(user.emailVerified) {
					userInfo.p = application.permissions.VERIFIED_USER;
					usersRef.doc(user.uid).set(userInfo);
				}
			} else {
				userInfo = doc.data();
				if(userInfo.p == application.permissions.USER && user.emailVerified) {
					userInfo.p = application.permissions.VERIFIED_USER;
					usersRef.doc(user.uid).update({p: application.permissions.VERIFIED_USER});
				}
			}
			userInfo.uid = user.uid;
			callback(userInfo);
		})
	}

	this.setTheme = function(userId, theme) {
		usersRef.doc(userId).update({t: theme});
	}

	this.sendNotification = function(userId, notification) {
		notificationsRef.child('content').child(userId).push(notification);
	}

	this.dismissNotifications = function(userId, notifications) {
		var updates = {};
		angular.forEach(notifications, function(notification) {
			var nid = notification.nid;
			updates[nid+'/read'] = true;
		})
		notificationsRef.child('content').child(userId).update(updates);
	}

	this.getNewNotifications = function(userId, callback) {
		notificationsRef.child('content').child(userId).orderByChild('read').equalTo(null).on('value', function(data) {
			callback(data.val());
		})
	}

	this.getNotifications = function(userId, callback) {
		notificationsRef.child('content').child(userId).on('value', function(data) {
			callback(data.val());
		})
	}

	this.setUserPermission = function(userId, permission) {
		usersRef.doc(userId).update({
			p: permission
		});
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
		usersRef.doc(userId).get().then(function(doc){
			if(!doc.empty) {
				var user = doc.data();
				user.uid = doc.id;
				callback(user);
			} else {
				callback(null);
			}
		});
	}

	this.getUserPromiseFromUID = function(uid) {
		return usersRef.doc(uid).get();
	}

	this.getUserFromUID = function(uid, callback) {
		FirebaseService.getUserPromiseFromUID(uid).then(function(user) {
			if(user.exists) {
				user = user.data();
				user.uid = uid;
				callback(user);
			} else {
				callback(null);
			}
		})
	}

	this.getAllUsers = function(callback) {
		usersRef.onSnapshot(function(data){
			var users = {};
			var user;
			data.forEach(function(doc) {
				user = doc.data();
				user.uid = doc.id;
				user.p = angular.isDefined(user.p) ? user.p : application.permissions.VERIFIED_USER;
				users[doc.id] = user;
			})
			callback(users);
		});
	}

	this.saveTeamInfo = function(uid, info) {
		if(info != null) {
			delete info.n;
			delete info.e;
			delete info.pURL;
			delete info.p;
			delete info.uid;
			delete info.t;
			delete info.c;
			delete info.$$hashKey;
		}
		var batch = firestore.batch();
		batch.set(teamRef.doc(uid), info);
		batch.update(usersRef.doc(uid), {team: info.type});
		batch.commit();
	}

	this.deleteTeamMember = function(uid) {
		var batch = firestore.batch();
		batch.delete(teamRef.doc(uid));
		batch.update(usersRef.doc(uid), {team: firebase.firestore.FieldValue.delete()});
		batch.commit();
	}

	this.getTeamPromiseFromURL = function(profileURL) {
		return teamRef.where('profileURL', '==', profileURL).get();
	}

	this.getTeamInfoFromURL = function(profileURL, callback) {
		FirebaseService.getTeamPromiseFromURL(profileURL).then(function(info) {
			if(!info.empty) {
				info = info.docs[0];
				var profile = info.data();
				FirebaseService.getUserFromUID(info.id, function(user) {
					if (user != null) {
						angular.extend(profile, user);
					}
					callback(profile);
				});
			} else {
				callback(null);
			}
		});
	}

	this.getTeamProfile = function(param, callback) {
		FirebaseService.getTeamInfoFromURL(param, callback);
	}

	this.getTeam = function(callback) {
		teamRef.onSnapshot(function(data) {
			if(!data.empty) {
				var list = {};
				var promises = [];
				data.forEach(function(doc) {
					list[doc.id] = doc.data();
					list[doc.id].uid = doc.id;
					promises.push(FirebaseService.getUserPromiseFromUID(doc.id));
				})
				Promise.all(promises).then(function(users) {
					users.forEach(function(user) {
						if(user.exists) {
							angular.extend(list[user.id], user.data());
						}
					});
					callback(list);
				})
			} else {
				callback(null);
			}
		});
	}

	this.getContributor = function(profileURL, callback) {
		FirebaseService.getTeamInfoFromURL(profileURL, function(info) {
			callback(null, info);
		})
	}

	this.getContributors = function(contributors, callback) {
		var promises = [];
		contributors.forEach(function(contributor) {
			promises.push(FirebaseService.getTeamPromiseFromURL(contributor));
		})

		var contributorsList = {};
		Promise.all(promises).then(function(data) {
			promises = [];
			data.forEach(function(contributor) {
				if(!contributor.empty) {
					contributor = contributor.docs[0];
					contributorsList[contributor.id] = contributor.data();
					promises.push(FirebaseService.getUserPromiseFromUID(contributor.id));
				}
			});
			Promise.all(promises).then(function(users) {
				users.forEach(function(user) {
					if(user.exists) {
						angular.extend(contributorsList[user.id], user.data());
					}
				})
				callback(contributorsList);
			})
		})
		callback(null)
	}

	this.addQuery = function(query, callback) {
		var result = {
			message: "Failed to send query. Try again later."
		}
		query.a = false;
		queryRef.add(query).then(function(error) {
			result = {
				status: 1,
				message: "Query sent!"
			}
			callback(result);
		}, function(error) {
			callback(result);
		})
	}

	this.setQueryAttended = function(queryId) {
		db.child('amazecreationz').child('query').child(queryId).child('attended').set(true);
	}

	this.getQuery = function(queryId, callback) {
		queryRef.doc(queryId).get().then(function(query) {
			if(query.empty) {
				callback(null);
			} else {
				callback(query.data());
			}
		})
	}

	this.deleteQuery = function(queryId) {
		queryRef.doc(queryId).delete();
	} 

	this.getAllQuery = function(callback) {
		queryRef.onSnapshot(function(queries) {
			if(queries.empty) {
				callback(null);
			} else {
				callback(queries.data())
			}
		}, function(error) {
			callback(null);
		})
	}

	this.getAttendedQueries = function(callback) {
		queryRef.where('a', '==', true).onSnapshot(function(queries) {
			if(queries.empty) {
				callback(null);
			} else {
				var queryList = [];
				queries = queries.docs;
				queries.forEach(function(query) {
					if(query.exists) {
						var queryId = query.id;
						query = query.data();
						query.id = queryId;
						queryList.push(query);
					}
				})
				callback(queryList)
			}
		}, function(error) {
			callback(null);
		})
	}

	this.getUnAttendedQueries = function(callback) {
		queryRef.where('a', '==', false).onSnapshot(function(queries) {
			if(queries.empty) {
				callback(null);
			} else {
				var queryList = {};
				queries = queries.docs;
				queries.forEach(function(query) {
					if(query.exists) {
						queryList[query.id] = query.data();
						queryList[query.id].id = query.id;
					}
				})
				callback(queryList)
			}
		}, function(error) {
			callback(null);
		})
	}

	this.setQueryReply = function(query) {
		queryRef.doc(query.id).set(query);
	}

	this.sendQueryReply = function(query, callback) {
		var date = new Date().getTime();
		var userId = query.uid;
		query.replyDate = date;
		query.attended = true;
		delete query.$$hashKey;
		if(query.uid) {
			var notification = {
				type: 'query',
				id: query.id,
				title: 'Reply for your query - '+ query.content,
				message: query.reply,
				date: date
			}
			FirebaseService.sendNotification(userId, notification);
		}
		FirebaseService.getAuthToken(function(token) {
			var params = {
				content: JSON.stringify({
					email: query.email,
					date: query.date,
					subject: "Query on "+$filter('date')(query.date, application.globals.dateFormat),
					body: "Query: "+query.content+"<br>Response: "+query.reply
				})
			}
			MailingService.getWithAuth('/sendReply', token, params).then(function(data) {
				FirebaseService.setQueryReply(query);
				callback(data.data);
			})
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
            cache: false
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

application.service('MailingService', function($http) {
	var APIDomain = angular.copy(application.mailingDomain.current);
	var MailingService = this;

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
            cache: false
        });
	}

	this.getWithAuth = function(API, authToken, params) {
		if(angular.isUndefined(params)) {
			params = {};
		}
		params.authToken = authToken;
		API = MailingService.getAPIWithParams(API, params);
		return MailingService.get(API);
	}
})

application.service('JavaServerService', function($http) {
	var APIDomain = angular.copy(application.javaServerDomain.current);
	var JavaServerService = this;

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
            cache: false
        });
	}

	this.getWithAuth = function(API, authToken, params) {
		if(angular.isUndefined(params)) {
			params = {};
		}
		params.authToken = authToken;
		API = MailingService.getAPIWithParams(API, params);
		return MailingService.get(API);
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