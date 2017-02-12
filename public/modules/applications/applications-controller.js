amazecreationz.controller('AppsController', ['$scope', '$rootScope', '$state', '$stateParams', function($scope, $rootScope, $state, $stateParams){
	$('.body-container').animate({scrollTop: 0}, 800);
	$rootScope.bck_image = "pencil.jpg";
	$scope.pageTitle = "Applications";
	
	if($stateParams.type) {
		$scope.type = $stateParams.type;
		$scope.appInfo = _.findWhere(amazecreationz.constants.apps, {id: $stateParams.type});

		if(angular.isUndefined($scope.appInfo)) {
			$state.go('apps', {type: undefined});
		}
		
		$scope.pageTitle = $scope.appInfo.name;
		$rootScope.bck_image = $scope.appInfo.bck_image || 'pencil.jpg';
	}
}]);

amazecreationz.controller('GPACalcController', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$cookies', function($scope, $rootScope, $state, $stateParams, $http, $cookies){
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
		firebase.storage().ref().child($rootScope.user_data.uid).child('gradecard.pdf').put($scope.gradecard).then(function(snapshot) {
			firebase.database().ref().child('gradecards').child($rootScope.user_data.uid).set('gradecard.pdf');
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
		db_ref.child('sgpacharts').child($rootScope.user_data.uid).on('value', function(data){
			$scope.sgpaChartData = data.val();
			_.defer(function(){$scope.$apply();});
			$('#showmore').removeClass('hide');
			$('#viewresults').addClass('hide');
		});
	}

	$scope.downloadResults = function() {
		alert("Download will be available in the coming version! Wait for it! :)")
	}
	
	firebase.auth().onAuthStateChanged(function(user) {
		if(user) {
			setResults(user.uid);
		}
	});
}]);