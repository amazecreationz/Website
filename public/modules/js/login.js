'use strict'
var auth = angular.module('amazecreationzAuth', ['ngMaterial', 'ngMessages']);

auth.config(function($locationProvider, $compileProvider) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
	$locationProvider.html5Mode(true);
});

auth.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default').primaryPalette('red');
});

auth.controller('AuthController', ['$scope', '$location', function($scope, $location) {
	var mainLoader = angular.element(document.getElementsByClassName("loader-shadow"));
	var redirect = $location.search().redirect || '/';
	$scope.action = $location.search().action || 'AUTHENTICATE';
	$scope.loader = true;

	var getIntentURL = function(app, token) {
		return 'intent://token/?value='+token+'#Intent;scheme='+app+';package=com.amazecreationz.'+app+';end';
	}

	var getDynamicLink = function(app, token, dLink) {
		return dLink+token+'&apn=com.amazecreationz.'+app+'&st=Amaze+Creationz+%7C+Custom+Authentication&sd=Amaze+Creationz+%7C+Sleek+Solutions+Everywhere&si=https://amazecreationz.in/resources/images/logo/logo-circle-250.png';
	}

	var setApplicationAuth = function(app, user, dLink) {
		$scope.action = 'AUTHENTICATE';
		mainLoader.addClass('hide');
		user.getIdToken().then(function(token) {
			$scope.appIntentURL = getDynamicLink(app.toLowerCase(), token, dLink);
			$scope.loader = false;
			$scope.$apply();
		});
	}

	var setUser = function() {
		var user = firebase.auth().currentUser;
		var userRef = firebase.firestore().collection('USERS').doc(user.uid);
		userRef.get().then(function(doc) {
			if(!doc.exists) {
				userRef.set({
					n: user.displayName,
					e: user.email,
					pURL: user.photoUrl || '/resources/images/logo.jpg',
					p: user.isEmailVerified ? 3 : 4
				});
			}
		});
	}

	$scope.changeAction = function(action) {
		$scope.action = action;
	}

	$scope.goToURL = function(url) {
		mainLoader.removeClass('hide');
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
				photoURL: '/resources/images/logo.jpg'
			}).then(function() {
				setUser();
				$scope.user.name = name;
				$scope.user.nickName = name.split(' ')[0];
				$scope.loader = false;
				$scope.$apply();
			});
			user.sendEmailVerification();
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
			if(user.displayName) {
				setUser();
			}
			$scope.user = {
				name: user.displayName,
				nickName: user.displayName ? user.displayName.split(' ')[0] : user.displayName,
				email: user.email,
				pURL: user.photoUrl || '/resources/images/logo/logo-circle-250.png'
			}
			var dLink = null;
			switch(redirect) {
				case 'async': dLink = 'https://a5b83.app.goo.gl/?link=https://amazecreationz.in/token?value=';
					setApplicationAuth(redirect, user, dLink);
					break;
				case 'EmployeeMeter': dLink = 'https://a5b83.app.goo.gl/?link=https://amazecreationz.in/auth/EmployeeMeter?token=';
					setApplicationAuth(redirect, user, dLink);
					break;
				default: $scope.goToURL(redirect);
			}	
		} else {
			$scope.action = 'SIGN_IN';
			$scope.loader = false;
			mainLoader.addClass('hide');
		}
		$scope.$apply();
	});
}]);