application.controller('CrewController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}
}]);

application.controller('UserModalController', ['$scope', '$state', '$stateParams', 'dialogParams', '$mdDialog', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, dialogParams, $mdDialog, AppService, FirebaseService){
	$scope.dialog = {
		currentUser: dialogParams.userInfo.uid == FirebaseService.getCurrentUserID(),
		permission: dialogParams.permission,
		permissions: angular.copy(application.permissions)
	};

	$scope.userInfo = dialogParams.userInfo;

	delete $scope.dialog.permissions.VISITOR;

	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.setPermission = function() {
		FirebaseService.setUserPermission($scope.userInfo.uid, $scope.userInfo.permission);
	}

	$scope.getPermissionLabel = function(permission) {
		return AppService.getPermissionType(permission);
	}
}]);

application.controller('CrewModalController', ['$scope', '$state', '$stateParams', '$mdDialog', 'dialogParams', 'FirebaseService', function($scope, $state, $stateParams, $mdDialog, dialogParams, FirebaseService){
	$scope.dialog = {
		levels: angular.copy(application.constants.crew.levels),
		crewTypes: angular.copy(application.constants.crew.crewTypes),
		permission: dialogParams.permission,
		permissions: angular.copy(application.permissions),
		title: dialogParams.title
	}	

	if(angular.isDefined(dialogParams.crewInfo)) {
		$scope.crewInfo = dialogParams.crewInfo;
		$scope.crewId = dialogParams.crewInfo.uid;
	}

	FirebaseService.getCrewExcludedUsers(function(users) {
		$scope.users = _.filter(users, function(user, userId) {
    		return true;
    	});
    	_.defer(function(){$scope.$apply();});
	})

	$scope.setDefault = function(crewType) {
		if(crewType == 'fullTime') {
			$scope.crewInfo.level = 4;
			$scope.crewInfo.designation = 'Developer';
		} else {
			delete $scope.crewInfo.level;
			delete $scope.crewInfo.designation;
		}
		$scope.crewInfo.crewType = crewType;
	}

	$scope.deleteCrew = function() {
		var dialogData = {
			uid: $scope.crewId,
			crewInfo: null
		}
		$mdDialog.hide(dialogData);
	}

	$scope.saveCrew = function() {
		var dialogData = {
			uid: $scope.crewId,
			crewInfo: $scope.crewInfo
		}
		$mdDialog.hide(dialogData);
	}

	$scope.onUserSelect = function(userInfo) {
		$scope.newCrew = true;
		$scope.crewInfo = {
			name: userInfo.name,
			email: userInfo.email,
			uid: userInfo.uid,
			image: userInfo.image,
			crewURL: userInfo.uid
		}
		$scope.crewId = userInfo.uid;
		$scope.dialog.title = userInfo.name;
		$scope.setDefault(angular.copy(application.constants.crew.crewTypes[0].id))
	}

	$scope.getCrewTypeLabel = function(crewType) {
		return _.find($scope.dialog.crewTypes, function(crew) {
			return crew.id == crewType;
		}).name;
	}

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}]);

application.controller('QueryModalController', ['$scope', '$state', '$stateParams', 'dialogParams', '$mdDialog', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, dialogParams, $mdDialog, AppService, FirebaseService){
	$scope.dialog = {
		permission: dialogParams.permission,
		permissions: angular.copy(application.permissions),
		dateFormat: angular.copy(application.globals.dateFormat)
	};

	$scope.query = dialogParams.queryInfo;
	$scope.showLoader = false;

	delete $scope.dialog.permissions.VISITOR;

	$scope.sendReply = function() {
		$scope.showLoader = true;
		FirebaseService.sendQueryReply($scope.query, function(data) {
			AppService.showToast(data.message);
			if(data.status) {
				$mdDialog.hide();
			}
			$scope.showLoader = false;
		})
	}

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}]);

application.controller('GPACalcController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', 'GitHubService', function($scope, $state, $stateParams, AppService, FirebaseService, GitHubService){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}

	$scope.uploadLoader = false;
	$scope.resultsLoader = false;

	$scope.showError = function(value) {
		if(value == 0){
			$scope.errorMessage = 'Select a valid gradecard pdf.'
		}
	}

	$scope.selectGC = function(file) { $scope.gradecard = file; };

	$scope.uploadGC = function() {
		$scope.errorMessage = '';
		$scope.uploadLoader = true;
		$('#showmore').addClass('hide');
		$('#viewresults').removeClass('hide');
		var gradecardName = $scope.appData.user.uid+'.pdf';
		firebase.storage().ref().child('appData').child('gradecards').child(gradecardName).put($scope.gradecard).then(function(snapshot) {
			$scope.gradecard = undefined;
			$scope.uploadLoader = false;
			$scope.resultsLoader = true;
			_.defer(function(){$scope.$apply();});
			var resultsTop = angular.element(document.getElementById('dummy-results')).prop('offsetTop')-20;
			$('.body-container').animate({scrollTop: resultsTop}, 800);
		}, function(error){
			$scope.errorMessage = JSON.stringify(error);
			_.defer(function(){$scope.$apply();});
		});
	}

	var setResults = function(uid) {
		var db_ref = firebase.database().ref();
		db_ref.child('gradedata').child(uid).on('value', function(data){
			$scope.gradecardData = JSON.parse(data.val());
			$scope.resultsLoader = false;
			_.defer(function(){$scope.$apply();});
		});
	}

	$scope.showResults = function() {
		var db_ref = firebase.database().ref();
		db_ref.child('sgpacharts').child($scope.appData.user.uid).on('value', function(data){
			$scope.sgpaChartData = data.val();
			_.defer(function(){$scope.$apply();});
			$('#showmore').removeClass('hide');
			$('#viewresults').addClass('hide');
		});
	}

	$scope.downloadResults = function() {
		alert("Download will be available in the coming version! Wait for it! :)")
	}

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			var fileName = 'appData/gradecards/'+user.uid+'.pdf';
			firebase.database().ref('appData/GPACalculator').child(user.uid).child('gradecard').set(fileName)
		}
	})
}]);

application.controller('EmployeeMeterController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', 'GitHubService', function($scope, $state, $stateParams, AppService, FirebaseService){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}
}]);