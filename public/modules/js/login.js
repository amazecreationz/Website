'use strict'
var auth = angular.module('amazecreationzAuth', ['ngMaterial', 'ngMessages']);

auth.config(function($locationProvider, $compileProvider) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
	$locationProvider.html5Mode(true);
});

auth.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default').primaryPalette('red');
});

auth.controller('AuthController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	var mainLoader = angular.element(document.getElementsByClassName("loader-shadow"));
	var logo = 'https://static.amazecreationz.in/images/logo/logo.jpg';
	var redirect = $location.search().redirect || '/';
	$scope.action = $location.search().action || 'AUTHENTICATE';
	$scope.loader = true;

	var getIntentURL = function(app, token) {
		return 'intent://token/?value='+token+'#Intent;scheme='+app+';package=com.amazecreationz.'+app+';end';
	}

	var getDynamicLink = function(app, token, dLink) {
		return dLink+token+'&apn=com.amazecreationz.'+app+'&st=Amaze+Creationz+%7C+Custom+Authentication&sd=Amaze+Creationz+%7C+Sleek+Solutions+Everywhere&si=https://amazecreationz.in/resources/images/logo/logo-circle-250.png';
	}

	var getCustomTokenAPI = function(email, pwd) {
		return `https://us-central1-amazecreationz-web.cloudfunctions.net/createCustomToken?email=${email}&password=${pwd}`;
	}

	var setApplicationAuth = function(app, user, dLink, pwd) {
		$scope.action = 'AUTHENTICATE';
		mainLoader.addClass('hide');
		$scope.loader = false;
		$scope.$apply();
		if(pwd) {
			$scope.aFD = {
				pwd: pwd,
				SIGNED_UP: true
			}
		}
		$scope.authenticate = function(pwd) {
			$scope.loader = true;
			$http.get(getCustomTokenAPI(user.email, pwd)).then(function(data) {
				var token = data.data;
				window.location.href = getDynamicLink(app, token, dLink);
			})
		}
	}

	var setUser = function(callback) {
		var user = firebase.auth().currentUser;
		var userRef = firebase.firestore().collection('USERS').doc(user.uid);
		userRef.get().then(function(doc) {
			if(!doc.exists) {
				userRef.set({
					n: user.displayName,
					e: user.email,
					pURL: user.photoUrl || logo,
					p: user.emailVerified ? 3 : 4
				}).then(function(data) {
					callback(true);
				});
			} else {
				if (doc.data().p == 4 && user.emailVerified) {
					userRef.update({p: 3}).then(function() {
						callback(true);
					})
				} else {
					callback(true);
				}
			}
		});
	}

	var setAction = function(user, pwd) {
		var dLink = null;
		switch(redirect) {
			case 'async': dLink = 'https://a5b83.app.goo.gl/?link=https://amazecreationz.in/token?value=';
				setApplicationAuth(redirect, user, dLink, pwd);
				break;
			case 'EmployeeMeter': dLink = 'https://a5b83.app.goo.gl/?link=https://amazecreationz.in/auth/EmployeeMeter?token=';
				setApplicationAuth(redirect, user, dLink, pwd);
				break;
			default: $scope.goToURL(redirect);
		}
	}

	$scope.changeAction = function(action) {
		$scope.action = action;
	}

	$scope.goToURL = function(url) {
		window.location.href = url;
	}

	$scope.signIn = function(email, pwd) {
		$scope.signinErrorMsg = undefined;
		$scope.loader = true;
		firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function(error) {
			$scope.loader = false;
			if(error.code == 'auth/user-not-found') {
				$scope.signinErrorMsg = 'Incorrect email! Check your email again.'
			} else if(error.code == 'auth/wrong-password') {
				$scope.signinErrorMsg = 'Wrong password! Try again.'
			}
			$scope.$apply();
		});
	}

	$scope.signUp = function(name, email, pwd) {
		$scope.signupErrorMsg = undefined;
		$scope.user = {};
		$scope.loader = true;
		firebase.auth().createUserWithEmailAndPassword(email, pwd).then(function(user) {
			user.updateProfile({
				displayName: name,
				photoURL: logo
			}).then(function() {
				user.sendEmailVerification();
				setUser(function(data) {
					if(data) {
						$scope.user.name = name;
						$scope.user.nickName = name.split(' ')[0];
						$scope.$apply();
						setAction($scope.user, pwd);
					}
				});
			});
		}).catch(function(error) {
			if(error.code == 'auth/email-already-in-use') {
				$scope.signupErrorMsg =  'Email already in use!';
				$scope.loader = false;
				$scope.$apply();
			}
		});
	}

	$scope.signOut = function() {
		$scope.loader = true;
		firebase.auth().signOut().then(function() {
			$scope.loader = false;
			$scope.action = 'SIGN_IN';
			$scope.user = {};
			$scope.$apply();
		});
	}

	$scope.sendRM = function(email, cemail) {
		if(email == cemail) {
			$scope.loader = true;
			firebase.auth().sendPasswordResetEmail(email).then(function(data) {
				$scope.resendMsg = 'Reset mail sent!';
				$scope.action('SIGN_IN');
				$scope.loader = false;
				$scope.$apply();
			}).catch(function(error) {
				$scope.resendMsg = error.code;
				$scope.loader = false;
				$scope.$apply();
			});
		}
	}

	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			if($scope.action != 'SIGN_UP') {
				setUser(function() {
					setAction(user);
				})
			}
			$scope.user = {
				name: user.displayName,
				nickName: user.displayName ? user.displayName.split(' ')[0] : user.displayName,
				email: user.email,
				pURL: user.photoURL || logo
			}	
		} else {
			$scope.action = 'SIGN_IN';
			mainLoader.addClass('hide');
			$scope.loader = false;
			$scope.$apply();
		}
	});
}]);