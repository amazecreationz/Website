application.controller('EditProfileModalController', ['$scope', '$state', '$stateParams', 'dialogParams', '$mdDialog', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, dialogParams, $mdDialog, AppService, FirebaseService){
	$scope.dialog = {
		action: dialogParams.action,
		theme: dialogParams.theme,
		userInfo: dialogParams.userInfo,
		loader: false,
		selectedImage : []
	}

	$scope.onImageSelect = function(image) {
		var reader = new FileReader();
		reader.onload = function(event) {
			$scope.imageSrc = event.target.result;
			$scope.$apply();
		}
		reader.readAsDataURL(image);
	}

	$scope.upload = function() {
		$scope.dialog.loader = true;
		FirebaseService.changeUserPicture(dialogParams.userInfo.uid, $scope.dialog.selectedImage, function(pURL) {
			$scope.dialog.loader = false;
			$mdDialog.cancel(pURL);
			$scope.$apply();
		})
	}

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}]);	

application.controller('UserModalController', ['$scope', '$state', '$stateParams', 'dialogParams', '$mdDialog', 'AppService', 'FirebaseService', function($scope, $state, $stateParams, dialogParams, $mdDialog, AppService, FirebaseService){
	$scope.dialog = {
		currentUser: dialogParams.userInfo.uid == FirebaseService.getCurrentUserID(),
		permission: dialogParams.permission,
		all_permissions: angular.copy(application.permissions),
		permissions: angular.copy(application.permissions)
	};

	$scope.userInfo = dialogParams.userInfo;
	delete $scope.dialog.permissions.VISITOR;
	delete $scope.dialog.permissions.USER;

	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.setPermission = function() {
		FirebaseService.setUserPermission($scope.userInfo.uid, $scope.userInfo.p);
	}

	$scope.getPermissionLabel = function(permission) {
		return AppService.getPermissionType(permission);
	}

	$scope.addToTeam = function() {
		$mdDialog.cancel('ADD_TEAM');
	}
}]);

application.controller('TeamModalController', ['$scope', '$state', '$stateParams', '$mdDialog', 'dialogParams', 'FirebaseService', function($scope, $state, $stateParams, $mdDialog, dialogParams, FirebaseService){
	$scope.dialog = {
		levels: angular.copy(application.constants.team.levels),
		types: angular.copy(application.constants.team.types),
		permission: dialogParams.permission,
		permissions: angular.copy(application.permissions),
		title: dialogParams.title
	}

	$scope.setDefault = function(type) {
		if(type == 'EMPLOYEE') {
			$scope.info.l = 4;
			$scope.info.d = 'Developer';
		} else {
			delete $scope.info.l;
			delete $scope.info.d;
		}
		$scope.info.type = type;
	}

	$scope.delete = function() {
		var dialogData = {
			uid: $scope.userId,
			info: null
		}
		$mdDialog.hide(dialogData);
	}

	$scope.save = function() {
		var dialogData = {
			uid: $scope.userId,
			info: $scope.info
		}
		$mdDialog.hide(dialogData);
	}

	$scope.getTypeLabel = function(type) {
		return _.find($scope.dialog.types, function(item) {
			return item.id == type;
		}).name;
	}

	$scope.cancel = function() {
		$mdDialog.cancel();
	};	

	if(angular.isDefined(dialogParams.info)) {
		$scope.info = dialogParams.info;
		$scope.userId = dialogParams.info.uid;
	}

	if(dialogParams.param) {
		$scope.addToTeam = true;
		$scope.info.profileURL = $scope.info.uid;
		$scope.setDefault(angular.copy(application.constants.team.types[0].id))
	}
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

application.controller('GPACalculatorController', ['$scope', '$state', '$http','AppService', 'FirebaseService', function($scope, $state, $http, AppService, FirebaseService){
	var params = $state.params.params;
	var id = $state.params.id;
	var tab = $state.params.tab;
	var currentState = $state.current.name;
	var dbRef = firebase.database().ref('appData/GPACalculator');
	var gradeCardStorageRef = firebase.storage().ref('appData/gradecards');

	var colors = angular.copy(application.colors);

	$scope.GPACalculator = {
		tabs: [{
			id: 'overview',
			name: 'Overview'
		}, {
			id: 'dashboard',
			name: 'Dashboard'
		}],
		currentTab: tab || 'overview',
		showUploadLoader: false,
		selectedFile: null
	};

	if(tab && _.findIndex($scope.GPACalculator.tabs, { id: tab }) == -1) {
		AppService.showNotFound();
	}

	var setTab = function(tabId) {
		AppService.goToState(currentState, {tab: tabId}, false, false);
	}

 
	var setSGPATextOnChart = function(chartData) {
		chartData.options.animation = {
			onComplete: function() {
				var chartInstance = this.chart;
				var ctx = chartInstance.ctx;
		        ctx.textAlign = "center";
		        ctx.textBaseline = "bottom";

		        this.data.datasets.forEach(function (dataset, i) {
		            var meta = chartInstance.controller.getDatasetMeta(i);
		            meta.data.forEach(function (bar, index) {
		                var data = dataset.data[index];                            
		                ctx.fillText(data, bar._model.x, bar._model.y - 5);
		            });
		        });
		    }
		}
		return chartData;
	}

	var getSGPAChartObject = function(semesterData) {
		var labels = [];
		var data = [];

		angular.forEach(semesterData, function(value, key) {
			labels.push(key.replace('_', ' '));
			data.push(value.SGPA.toFixed(2));
		})
		var dataLength = data.length;

		return {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					backgroundColor: colors.slice(0, dataLength),
					data: data
				}]
			},
			options: {
				responsive: true,
				legend: {
					display: false
				},
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true,
		                    suggestedMax: 10
		                }
		            }],
		            xAxes: [{
		                display: false
		            }]
		        }
		    }
		}	
	}

	var setStudentDataListener = function(dbRef) {
		dbRef.doc('SD').onSnapshot(function(doc) {
			if (doc.exists) {
				$scope.GPACalculator.studentData = doc.data();
				$scope.GPACalculator.semesterChartData = getSGPAChartObject(angular.copy($scope.GPACalculator.studentData).SEMESTERS);
			} else {
				$scope.GPACalculator.studentData = null;
				$scope.GPACalculator.semesterChartData = null;
			}
			$scope.showUploadLoader = false;
			$scope.GPACalculator.gradecard = null;
			$scope.GPACalculator.selectedFile = null;
			_.defer(function(){$scope.$apply();});
		})
	}

	$scope.GPACalculator.onGradeCardSelect = function(gradecard) {
		$scope.GPACalculator.gradecard = gradecard;
	}

	$scope.GPACalculator.uploadGradeCard = function() {
		if(angular.isDefined($scope.GPACalculator.gradecard) && angular.isDefined($scope.appData.user.uid)) {
			$scope.showUploadLoader = true;
			var userId = $scope.appData.user.uid;
			var fileName = userId+'.pdf';
			gradeCardStorageRef.child(fileName).put($scope.GPACalculator.gradecard).then(function(snapshot) {
				FirebaseService.addToServerQueue(userId, id, fileName);
			})
			_.defer(function(){$scope.$apply();});
		}
	}

	$scope.GPACalculator.onTabSelect = function(tab) {
		setTab(tab.id);
	}

	var chartPromise = AppService.loadScript('https://static.amazecreationz.in/latest/js/Chart.min.js');
	var chartBundlePromise = AppService.loadScript('https://static.amazecreationz.in/latest/js/Chart.bundle.min.js');
	Promise.all([chartPromise, chartBundlePromise]).then(function(values) {
		$scope.chartLoaded = true;
	});

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			var dbRef = FirebaseService.getAppDataRef(user.uid, id);
			setStudentDataListener(dbRef);
		} else {
			$scope.GPACalculator.studentData = null;
			$scope.GPACalculator.semesterChartData = null;
		}
	})
}]);

application.controller('EmployeeMeterController', ['$scope', '$state', '$filter', 'AppService', 'FirebaseService', function($scope, $state, $filter, AppService, FirebaseService){
	var app = $state.params.id;
	var employeeId = $state.params.params;
	var tab = $state.params.tab;
	var currentState = $state.current.name;
	var today = new Date(new Date().setHours(0,0,0,0));
	var currentDate = today, currentKey, emRef, empLRef, empDRef, empSRef;

	$scope.eM = {
		tabs: [{
			id: 'overview',
			name: 'Overview'
		}, {
			id: 'dashboard',
			name: 'Dashboard'
		}],
		days: ["S", "M", "T", "W", "T", "F", "S"],
		currentTab: tab || 'overview',
		today: today,
		loadEmployee: true,
		showEmployeeForm: false,
		calLegends: {"Weekly Holidays":"bg-theme-lime", "Special Holidays":"bg-theme-yellow", "Absent":"bg-theme-red", "Payment":"bg-theme-grey"}  
	};

	if(tab) {
		if(_.findIndex($scope.eM.tabs, { id: tab }) == -1) {
			AppService.showNotFound();
		}
	}

	var setTab = function(tabId) {
		AppService.goToState(currentState, {tab: tabId, params: employeeId}, false, false);
	}

	var setEmployeeId = function(eId) {
		AppService.goToState(currentState, {params: eId}, false, false);
	}

	var addEmployee = function() {
		$scope.eM.loadEmployee = false;
		$scope.eM.showEmployeeForm = true;
		$scope.eM.employee = {
			image: $scope.globals.logo_square,
			type: 'Employee',
			wage: 100,
			cU: 'INR',
			jD: new Date(today),
			h: [0] /*Sunday as default holiday*/
		}
	}

	var setEmployeeData = function(eId) {
		$scope.eM.loadEmployee = true;
		$scope.eM.showEmployeeForm = false;
		empLRef.doc(eId).get().then(function(doc) {
			if(doc.exists) {
				$scope.eM.loadEmployee = false;
				$scope.eM.employee = doc.data();
				$scope.eM.employee.id = doc.id;
				_.defer(function(){$scope.$apply();});
			} else {
				AppService.showNotFound();
			}
		});
	}

	var setEmployeeList = function() {
		empLRef.onSnapshot(function(data) {
			$scope.eM.eList = {};
			if(!data.empty) {
				data.docs.forEach(function(doc) {
					$scope.eM.eList[doc.id] = doc.data();
				})
				if(!employeeId) {
					employeeId = _.keys($scope.eM.eList)[0];
					setEmployeeData(employeeId);
				}
			} else {
	    		addEmployee();
			}
			_.defer(function(){$scope.$apply();});
		});
	}

	$scope.eM.shuffleHoliday = function(h) {
		if(angular.isUndefined($scope.eM.employee.h)) {
			$scope.eM.employee.h = [];
		}
		var index = $scope.eM.employee.h.indexOf(h);
		if(index > -1) {
			$scope.eM.employee.h.splice(index, 1);
		} else {
			$scope.eM.employee.h.push(h);
		}
	}

	$scope.eM.eFunction = function(action, eId) {
		switch(action) {
			case 'delete': $scope.eM.loadEmployee = true;
				var batch = firebase.firestore().batch();
				batch.delete(empLRef.doc(eId));
				batch.delete(empDRef.doc(eId));
				batch.delete(empSRef.doc(eId));
				batch.commit().then(function() {
					addEmployee();
					setEmployeeId(null);
				})
				break;
			case 'add': addEmployee();
				setEmployeeId(null);
				break;
			case 'edit':$scope.eM.showEmployeeForm = true;
				break;
			case 'select': setEmployeeId(eId);
				setEmployeeData(eId);
				break;
			case 'save': $scope.eM.loadEmployee = true;
				var batch = firebase.firestore().batch();
				if(eId) {
					delete $scope.eM.employee.id;
				} else {
					eId = empLRef.doc().id;
					batch.set(empSRef.doc(eId), {
						fP: 0,
						tA: 0,
						tOH: 0
					});
				}
				batch.set(empLRef.doc(eId), $scope.eM.employee);
				batch.commit().then(function() {
					setEmployeeId(eId);
					setEmployeeData(eId);
				});
				break;
		}
	}

	$scope.eM.onTabSelect = function(tab) {
		setTab(tab.id);
	}

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			emRef = FirebaseService.getAppDataRef(user.uid, app).doc('DATA');
			empLRef = emRef.collection('eL');
			empDRef = emRef.collection('eD');
			empSRef = emRef.collection('eS');
			setEmployeeList();
			if(employeeId) {
				setEmployeeData(employeeId);
			}
		} else {
			addEmployee();
		}
	})
}]);