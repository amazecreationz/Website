application.controller('CrewController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}
}]);

application.controller('UserModalController', ['$scope', '$state', '$stateParams', 'dialogParams', '$mdDialog', 'FirebaseService', function($scope, $state, $stateParams, dialogParams, $mdDialog, FirebaseService){
	$scope.dialog = {
		userInfo: dialogParams.userInfo,
		currentUser: dialogParams.userInfo.uid == FirebaseService.getCurrentUserID(),
		permissions: angular.copy(application.permissions)
	};

	delete $scope.dialog.permissions.VISITOR;

	$scope.dialog.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.dialog.setPermission = function() {
		FirebaseService.setUserPermission($scope.dialog.userInfo.uid, $scope.dialog.userInfo.permission);
	}
}]);

application.controller('CrewModalController', ['$scope', '$state', '$stateParams', '$mdDialog', 'dialogParams', 'FirebaseService', function($scope, $state, $stateParams, $mdDialog, dialogParams, FirebaseService){
	$scope.dialog = {
		levels: angular.copy(application.crew.levels),
		crewTypes: angular.copy(application.crew.crewTypes),
		title: dialogParams.title
	}

	if(angular.isDefined(dialogParams.crewInfo)) {
		$scope.dialog.crewInfo = dialogParams.crewInfo;
		$scope.dialog.crewId = dialogParams.crewInfo.uid;
	}

	var validateCrewInfo = function(crewInfo) {
		if(angular.isDefined(crewInfo.level) && angular.isDefined(crewInfo.designation) && angular.isDefined(crewInfo.crewURL)){
			return true;
		}
		return false;
	}

	FirebaseService.getCrewExcludedUsers(function(users) {
		$scope.dialog.users = _.filter(users, function(user, userId) {
    		return true;
    	});
    	_.defer(function(){$scope.$apply();});
	})

	$scope.dialog.deleteCrew = function() {
		delete $scope.dialog.crewInfo.crewType;
		delete $scope.dialog.crewInfo.level;
		delete $scope.dialog.crewInfo.designation;
		delete $scope.dialog.crewInfo.crewURL;
		$mdDialog.hide($scope.dialog.crewInfo);
	}

	$scope.dialog.saveCrew = function() {
		if(validateCrewInfo($scope.dialog.crewInfo)){
			$mdDialog.hide($scope.dialog.crewInfo);
		}
	}

	$scope.dialog.onUserSelect = function(userInfo) {
		$scope.dialog.newCrew = true;
		$scope.dialog.crewInfo = userInfo;
		$scope.dialog.crewInfo.level = 4;
		$scope.dialog.crewInfo.crewType = angular.copy(application.crew.crewTypes[0].id);
		$scope.dialog.crewInfo.designation = 'Developer';
		$scope.dialog.crewId = userInfo.uid;
		$scope.dialog.crewInfo.crewURL = userInfo.uid;
	}

	$scope.dialog.cancel = function() {
		$mdDialog.cancel();
	};
}]);

application.controller('GPACalcController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', 'GitHubService', function($scope, $state, $stateParams, AppService, FirebaseService, GitHubService){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}
}]);

application.controller('EmployeeMeterController', ['$scope', '$state', '$stateParams', 'AppService', 'FirebaseService', 'GitHubService', function($scope, $state, $stateParams, AppService, FirebaseService){
	var params = $stateParams.params;
	var id = $stateParams.id;

	var setParams = function(params) {
		$state.go('view', {params: params})
	}
}]);