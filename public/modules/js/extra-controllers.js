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

application.controller('GPACalculatorController', ['$scope', '$state', '$http','AppService', 'JavaServerService', function($scope, $state, $http, AppService, JavaServerService){
	var params = $state.params.params;
	var id = $state.params.id;
	var tab = $state.params.tab;
	var currentState = $state.current.name;
	var dbRef = firebase.database().ref('appData/GPACalculator');
	var storageRef = firebase.storage().ref('appData/gradecards');
	var gpaAPI ='/gpa';

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

	if(tab) {
		if(_.findIndex($scope.GPACalculator.tabs, { id: tab }) == -1) {
			AppService.showNotFound();
		}
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
			labels.push(key.	replace('_', ' '));
			data.push(value.SGPA);
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

	$scope.GPACalculator.onGradeCardSelect = function(gradecard) {
		$scope.GPACalculator.gradecard = gradecard;
	}

	$scope.GPACalculator.uploadGradeCard = function() {
		if(angular.isDefined($scope.GPACalculator.gradecard) && angular.isDefined($scope.appData.user.uid)) {
			$scope.showUploadLoader = true;
			var userId = $scope.appData.user.uid;
			var fileName = userId+'.pdf';
			storageRef.child(fileName).put($scope.GPACalculator.gradecard).then(function(snapshot) {
				var fullAPI = JavaServerService.getAPIWithParams(gpaAPI, {userId: userId});
				JavaServerService.get(fullAPI).then(function(data) {
					$scope.GPACalculator.studentData = undefined;
					$scope.GPACalculator.semesterChartData = undefined;
					var processedData = data.data;
					processedData.semesterChartData = getSGPAChartObject(processedData.studentData.SEMESTER_INFO)
					dbRef.child(userId).set(processedData);
					$scope.showUploadLoader = false;
					$scope.GPACalculator.gradecard = undefined;
					$scope.GPACalculator.selectedFile = undefined;
					_.defer(function(){$scope.$apply();});
				}).catch(function(error) {
					console.error(error);
					$scope.showUploadLoader = false;
					_.defer(function(){$scope.$apply();});
				})
			})
		}
	}

	$scope.GPACalculator.onTabSelect = function(tab) {
		setTab(tab.id);
	}

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			/*var chartPromise = AppService.loadScript('Chart.min.js', true);
			var chartBundlePromise = AppService.loadScript('Chart.bundle.min.js', true);
			Promise.all([chartPromise, chartBundlePromise]).then(function(values) {
				$scope.chartLoaded = true;
			})*/

			/*dbRef.child(user.uid).on('value', function(data) {
				$scope.GPACalculator.studentData = data.val().studentData;
				$scope.GPACalculator.semesterChartData = setSGPATextOnChart(data.val().semesterChartData);
				_.defer(function(){$scope.$apply();});
			})*/
		} else {
			$scope.GPACalculator.studentData = null;
			$scope.GPACalculator.semesterChartData = null;
		}
	})
}]);

application.controller('EmployeeMeterController', ['$scope', '$state', '$filter', 'AppService', function($scope, $state, $filter, AppService){
	var params = $state.params.params;
	var tab = $state.params.tab;
	var currentState = $state.current.name;
	var today = new Date(new Date().setHours(0,0,0,0));
	var currentDate = today, currentKey, dbRef, empLRef, empDRef, empSRef;

	$scope.EmployeeMeter = {
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
		if(_.findIndex($scope.EmployeeMeter.tabs, { id: tab }) == -1) {
			AppService.showNotFound();
		}
	}

	var setTab = function(tabId) {
		AppService.goToState(currentState, {tab: tabId}, false, false);
	}

	var setEmployeeId = function(employeeId) {
		params = employeeId;
		AppService.goToState(currentState, {params: employeeId}, false, false);
	}

	var getMonthKey = function(month, year) {
		return $filter('date')(new Date(year, month, 1), 'yyyyMM');
	}

	var getMonthKeyFromDate = function(date) {
		return $filter('date')(date, 'yyyyMM');
	}

	var getTotalHolidays = function(startDate, endDate, h) {
		var stD = startDate.getDay(),
			tH = 0,
			tD = Math.ceil((endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1); /*Total days btw dates(incl. both)*/

		angular.forEach(h, function(hD) {
			var day = (stD == hD ? 1 : 8) - (stD-hD);
			while(day <= tD) {
				tH++;
				day += 7;
			}
		})

		return {
			tH: tH,
			tD: tD
		};
	}

	var setMonthHolidays = function(sD) {
		var h = $scope.EmployeeMeter.employee.h,
			month = sD.getMonth(),
			year = sD.getFullYear(),
			mT = new Date(year, month+1, 0).getDate(),
			stD = new Date(year, month, 1).getDay(); 

		$scope.EmployeeMeter.mH = [];
		angular.forEach(h, function(hD) {
			var day = ((stD-hD) > 1 ? 8 : 1) - (stD-hD);
			while(day <= mT) {
				$scope.EmployeeMeter.mH.push(day);
				day += 7;
			}
		})
	}

	var setNetValues = function() {
		var fT = getTotalHolidays(new Date($scope.EmployeeMeter.employee.jD), today, $scope.EmployeeMeter.employee.h),
			s = $scope.EmployeeMeter.s;

		s.tW = fT.tD - (fT.tH + s.tOH);
		s.tP = s.tW - s.tA;
		s.nB = s.fP - (s.tP*$scope.EmployeeMeter.employee.wage);
		if(s.nB > 0) {
			$scope.EmployeeMeter.oweMessage = $scope.EmployeeMeter.employee.name + " owes you " + s.nB + " " + $scope.EmployeeMeter.employee.cU;
		} else if(s.nB < 0) {
			$scope.EmployeeMeter.oweMessage = "You owe " + $scope.EmployeeMeter.employee.name + " " + s.nB*-1 + " " + $scope.EmployeeMeter.employee.cU;
		} else {
			$scope.EmployeeMeter.oweMessage = "All dues cleared"
		} 
		$scope.EmployeeMeter.s = s;
	}

	var setSummaryAndBars = function(mD) {
		var sD = new Date($scope.EmployeeMeter.sD),
			mA = 0, 
			mH = 0,
			mPay = 0;
			

		$scope.EmployeeMeter.barsData = {};
		if(mD != null && angular.isDefined(mD.d)) {
			angular.forEach(mD.d, function(value, day) {
				var colors = [];
				if(value.p>0) {
					colors.push('bg-theme-grey');
					mPay += value.p;
				}
				if(value.mA) {
					colors.push('bg-theme-red'); 
					mA++;
				}
				if(value.h) {
					colors.push('bg-theme-lime'); 
					mH++;
				}
				if(colors) {
					$scope.EmployeeMeter.barsData[day] = colors;
				}
			});
		}

		angular.forEach($scope.EmployeeMeter.mH, function(day) {
			var colors = $scope.EmployeeMeter.barsData[day] || [];
			colors.push('bg-theme-yellow');
			$scope.EmployeeMeter.barsData[day] = colors;
		})

		var	month = sD.getMonth(),
			jD = new Date($scope.EmployeeMeter.employee.jD),
			sMDate,eMDate;

		if(month == jD.getMonth()) {
			sMDate = jD.getDate();
		} 
		sMDate = new Date(sD.setDate(sMDate || 1));

		if(month == today.getMonth()) {
			eMDate = today;
		} else {
			var year = sD.getFullYear();
			var lastDate = new Date(year, month+1, 0).getDate();
			eMDate = new Date(year, month, lastDate);
		}

		var mT = getTotalHolidays(sMDate, eMDate, $scope.EmployeeMeter.employee.h);	

		mT.tW = mT.tD - (mT.tH + mH);
		mT.mP = mT.tW - mA;
		$scope.EmployeeMeter.mS = {
			mA: mA,
			mWH: mT.tH, 
			mH: mH,
			mP: mT.mP,
			mTW: mT.tW,
			mPay: mPay,
			mB: mPay - (mT.mP*$scope.EmployeeMeter.employee.wage)
		};
	} 

	var setDayData = function(day, data) {
		if(angular.isUndefined(data)) {
			data = {};
		}
		$scope.EmployeeMeter.day = {
			mA : data.mA || false,
			h : data.h || false,
			p: data.p || 0,
			isH: $scope.EmployeeMeter.mH.indexOf(day) > -1
		};
	}

	var addEmployee = function() {
		setEmployeeId(null);
		$scope.EmployeeMeter.jD = today;
		$scope.EmployeeMeter.employee = {
			image: '/resources/images/logo/logo.jpg',
			type: 'Employee',
			wage: 100,
			cU: 'INR',
			h: [0] /*Sunday as default holiday*/
		}
	}

	var showEmployee = function(employeeId) {
		setEmployeeId(employeeId);

		$scope.EmployeeMeter.loadEmployee = true;
		delete $scope.EmployeeMeter.sD;
		delete $scope.EmployeeMeter.mD;
		delete $scope.EmployeeMeter.mS;
		delete $scope.EmployeeMeter.mH;
		delete $scope.EmployeeMeter.barsData;
		delete $scope.EmployeeMeter.day;
		$scope.EmployeeMeter.employee = {
			id: employeeId
		}

		var empPromise = [];
		empPromise.push(empLRef.child(employeeId).once('value'));
		empPromise.push(empSRef.child(employeeId).once('value'));

		Promise.all(empPromise).then(function(data) {
			var empData = data[0].val();
			if(empData == null) {
				AppService.showNotFound();
				return;
			}

			$scope.EmployeeMeter.loadEmployee = false;
			$scope.EmployeeMeter.employee = empData;
			$scope.EmployeeMeter.employee.id = employeeId;
			$scope.EmployeeMeter.s = data[1].val();
			$scope.EmployeeMeter.sD = currentDate.getTime();
			currentKey = null;
			_.defer(function(){$scope.$apply();});
			setNetValues();
		})
	}

	$scope.EmployeeMeter.onDateSelect = function(sD) {};

	$scope.EmployeeMeter.employeeFunction = function(action, employeeId) {
		switch(action) {
			case 'delete': empLRef.child(employeeId).remove();
				empDRef.child(employeeId).remove();
				empSRef.child(employeeId).remove();
			case 'add': addEmployee();
				$scope.EmployeeMeter.showEmployeeForm = true;
				break;
			case 'edit': $scope.EmployeeMeter.showEmployeeForm = true;
				$scope.EmployeeMeter.jD = new Date($scope.EmployeeMeter.employee.jD);
				break;
			case 'save': $scope.EmployeeMeter.showEmployeeForm = false;
				var empPromise = [];
				$scope.EmployeeMeter.loadEmployee = true;

				if(employeeId) {
					delete $scope.EmployeeMeter.employee.id;
				} else {
					$scope.EmployeeMeter.employee.jD = new Date($scope.EmployeeMeter.jD.setHours(0,0,0,0)).getTime();
					employeeId = empLRef.push().key;
					empPromise.push(empSRef.child(employeeId).set({
						fP: 0,
						tA: 0,
						tOH: 0
					}));
				}
				
				empPromise.push(empLRef.child(employeeId).set($scope.EmployeeMeter.employee));
				Promise.all(empPromise).then(function(data) {
					showEmployee(employeeId)
				})
				break;
			case 'select': $scope.EmployeeMeter.showEmployeeForm = false;
				showEmployee(employeeId);
				break;
		}
	}

	$scope.EmployeeMeter.shuffleHoliday = function(h) {
		if(angular.isUndefined($scope.EmployeeMeter.employee.h)) {
			$scope.EmployeeMeter.employee.h = [];
		}
		var index = $scope.EmployeeMeter.employee.h.indexOf(h);
		if(index > -1) {
			$scope.EmployeeMeter.employee.h.splice(index, 1);
		} else {
			$scope.EmployeeMeter.employee.h.push(h);
		}
	}

	$scope.EmployeeMeter.onTabSelect = function(tab) {
		setTab(tab.id);
	}

	$scope.$watchGroup(['EmployeeMeter.mD', 'EmployeeMeter.sD'], function(values) {
		var mD = values[0],
			sD = values[1];

		if(angular.isDefined(sD)) {
			sD = new Date(sD);
			var employeeId = $scope.EmployeeMeter.employee.id,
				nextKey = getMonthKeyFromDate(sD); 

			if(angular.isUndefined(currentKey) || currentKey!=nextKey) {
				currentKey = nextKey;
				$scope.EmployeeMeter.mD = undefined;
				$scope.EmployeeMeter.mDKey = undefined;
				setMonthHolidays(sD);

				empDRef.child(employeeId).orderByChild('key').equalTo(currentKey).once('value', function(data) {
					data = data.val();
					if(data != null) {
						var mDKey = _.keys(data)[0];
						$scope.EmployeeMeter.mDKey = mDKey;
						$scope.EmployeeMeter.mD = data[mDKey];	
					} else {
						$scope.EmployeeMeter.mD = null;
					}
					_.defer(function(){$scope.$apply();});
					return;
				})
				return;
			}
		}

		if(angular.isDefined(mD) && angular.isDefined(sD)) {
			sD = new Date(sD);
			var employeeId = $scope.EmployeeMeter.employee.id,
				mKey = getMonthKeyFromDate(sD),
				day = sD.getDate(),
				mDKey = $scope.EmployeeMeter.mDKey || empDRef.push().key,
				mDRef = empDRef.child(employeeId).child(mDKey),
				sRef = empSRef.child(employeeId);

			if(mD == null) {
				mD = {
					key: mKey
				}
				mDRef.set(mD);
				$scope.EmployeeMeter.mDKey = mDKey;
				$scope.EmployeeMeter.mD = mD;
				return;
			}

			if(angular.isUndefined(mD.d)) {
				mD.d = {};
			}

			setSummaryAndBars(mD);
			setDayData(day, mD.d[day]);

			var dayRef = mDRef.child('d').child(day);

			$scope.EmployeeMeter.loadDay = function() {
				setDayData(mD.d[day]);
			}

			$scope.EmployeeMeter.markAbsent = function(value) {
				dayRef.child('mA').set(value ? value : null);
				if(angular.isUndefined(mD.d[day])) {
					mD.d[day] = {
						mA: false
					}
				}
				mD.d[day].mA = value ? value : null;
				value = value ? 1 : -1;
				$scope.EmployeeMeter.mD = mD;
				$scope.EmployeeMeter.s.tA += value;
				setNetValues();
				setSummaryAndBars(mD);
				sRef.child('tA').transaction(function(tA) {
					return tA + value;
				});
			}

			$scope.EmployeeMeter.markHoliday = function(value) {
				dayRef.child('h').set(value ? value : null);
				if(angular.isUndefined(mD.d[day])) {
					mD.d[day] = {
						h: false
					}
				}
				mD.d[day].h = value ? value : null;
				value = value ? 1 : -1;
				$scope.EmployeeMeter.mD = mD;
				$scope.EmployeeMeter.s.tOH += value;
				setNetValues();
				setSummaryAndBars(mD);
				sRef.child('tOH').transaction(function(tOH) {
					return tOH + value;
				});
			}

			$scope.EmployeeMeter.markPayment = function(value) {
				dayRef.child('p').set(value ? value : null);
				value = value ? value : 0;
				if(angular.isUndefined(mD.d[day])) {
					mD.d[day] = {
						p: 0
					}
				}
				var pD = value - (mD.d[day].p ? mD.d[day].p : 0);
				mD.d[day].p = value ? value : 0;
				$scope.EmployeeMeter.mD = mD;
				$scope.EmployeeMeter.s.fP += pD;
				setNetValues();
				setSummaryAndBars(mD);
				sRef.child('fP').transaction(function(fP) {
					return (fP + pD);
				});
			}
		}
	});

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			dbRef = firebase.database().ref('appData').child('EmployeeMeter').child(user.uid);
			empLRef = dbRef.child('eL');
			empDRef = dbRef.child('eD');
			empSRef = dbRef.child('eS');
			empLRef.on('value', function(data) {
				$scope.EmployeeMeter.employeeList = data.val();
		    	if(data.val() == null) {
		    		$scope.EmployeeMeter.loadEmployee = false;
		    		$scope.EmployeeMeter.showEmployeeForm = true;
		    		addEmployee();
		    	} else if(!params) {
		    		showEmployee(_.keys(data.val())[0]);
		    	} 
				_.defer(function(){$scope.$apply();});
			});

			if(params) {
				showEmployee(params);
			}
		} else {
			addEmployee();
		}
	})
}]);

application.controller('SATController', ['$scope', '$state', 'AppService', function($scope, $state, AppService) {
	var params = $state.params.params || null;
	var tab = $state.params.tab || 'overview';
	var currentState = $state.current.name;
}]);

application.controller('SATController', ['$scope', '$state', '$mdDialog', 'AppService', function($scope, $state, $mdDialog, AppService) {
	var params = $state.params.params || null;
	var tab = $state.params.tab || 'overview';
	var currentState = $state.current.name;
	var dbRef, pLRef, pDRef, pCRef, periodId;
	var today = new Date(new Date().setHours(0,0,0,0));
	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	$scope.SAT = {
		tabs: [{
			id: 'overview',
			name: 'Overview'
		}, {
			id: 'dashboard',
			name: 'Dashboard'
		}],
		currentTab: tab,
		today: today,
		showPeriodForm: true,
		loadPeriod: true
	};

	if(tab) {
		if(_.findIndex($scope.SAT.tabs, { id: tab }) == -1) {
			AppService.showNotFound();
		}
	}

	var changeState = function(tabId, pId) {
		AppService.goToState(currentState, {tab: tabId, params: pId}, false, false);
	}

	var setTab = function(tabId) {
		AppService.goToState(currentState, {tab: tabId}, false, false);
	}

	var setParams = function(params) {
		AppService.goToState(currentState, {params: params}, false, false);
	}

	var scrollToSection = function(id) {
		var top = angular.element(document.getElementById(id)).prop('offsetTop');
		top -= AppService.mSize('gt-sm') ? 40 : 10;
		AppService.scrollTo(top);
	}

	var resetPeriod = function() {
		$scope.SAT.period = {
			aC: []
		}
	}

	var resetCourse = function() {
		$scope.course = {
			s: {}
		}
	}

	var setSchedule = function(cData, date) {
		var day = date.getDay();
	}

	var setPeriod = function(pId) {
		$scope.SAT.loadPeriod = true;

		pLRef.child(pId).once('value').then(function(data) {
			var pData = data.val();

			if(pData == null) {
				AppService.showNotFound();
				return;
			}

			$scope.SAT.period = pData;
			$scope.SAT.period.aC = pData.aC || [];
			$scope.SAT.period.id = periodId = data.key;
			$scope.SAT.showPeriodForm = false;
			$scope.SAT.loadPeriod = false;
			_.defer(function(){$scope.$apply();});
		})

		pCRef.child(pId).once('value').then(function(data) {
			$scope.SAT.courseList = data.val();
			_.defer(function(){$scope.$apply();});
		}) 
	}

	var setCourse = function(cId) {
		if($scope.SAT.courseList != null) {
			pDRef.child(periodId).child(cId).once('value').then(function(data) {
				$scope.SAT.course = $scope.SAT.courseList[cId];
				$scope.SAT.cS = data.val();
			})
		}
	}

	$scope.SAT.onTabSelect = function(tab) {
		setTab(tab.id);
	}


	$scope.SAT.periodFunction = function(action, pId) {
		switch(action) {
			case 'delete': pLRef.child(pId).remove();
				pDRef.child(pId).remove();
				pCRef.child(pId).remove();
			case 'add': resetPeriod();
				$scope.SAT.showPeriodForm = true;
				$scope.SAT.loadPeriod = false;
				$scope.SAT.sD = today;
				scrollToSection('section-form');
				setParams(null);
				break;
			case 'edit': $scope.SAT.showPeriodForm = true;
				$scope.SAT.sD = new Date($scope.SAT.period.sD);
				break;
			case 'save': $scope.SAT.showPeriodForm = false;
				if(!pId) {
					$scope.SAT.period.sD = $scope.SAT.sD.getTime();
				}
				pId = pId || pLRef.push().key;
				delete $scope.SAT.period.id;
				printString($scope.SAT.period)
				$scope.SAT.period.aC = JSON.parse(angular.toJson($scope.SAT.period.aC));
				pLRef.child(pId).set($scope.SAT.period);
				break;
			case 'select': $scope.SAT.showPeriodForm = false;
				setPeriod(pId);
				setParams(pId);
				scrollToSection('section-form');
				break;
		}
	}

	$scope.SAT.courseFunction = function(action, cId) {
		switch(action) {
			case 'delete': var pId = $scope.SAT.period.id;
				pDRef.child(pId).child(cId).remove();
				pCRef.child(pId).child(cId).remove();
			case 'add': resetCourse();
				$scope.SAT.showCourseForm = true;
				$scope.SAT.loadCourse = false;
				scrollToSection('course-form');
				break;
			case 'edit': $scope.SAT.showCourseForm = true;
				break;
			case 'save': $scope.SAT.showCourseForm = false;
				break;
			case 'select': $scope.SAT.showCourseForm = false;
				setCourse(pId);
				scrollToSection('course-form');
				break;
		}
	}

	$scope.$watch('appData.user', function(user) {
		if(user.uid) {
			dbRef = firebase.database().ref('appData').child('SAT').child(user.uid);
			pLRef = dbRef.child('pL');
			pCRef = dbRef.child('pC');
			pDRef = dbRef.child('pD');
			pLRef.on('value', function(data) {
				data = data.val();
				$scope.SAT.periodList = data;
				if(data != null) {
					$scope.SAT.showPeriodForm = false;
					if(params == null) {
						setPeriod(_.keys(data)[0]);
					}
				} else {
					resetPeriod();
					$scope.SAT.loadPeriod = false;
				}
				_.defer(function(){$scope.$apply();});
			});

			if(params != null) {
				setPeriod(params);
				setParams(params);
			}
		} else {
			resetPeriod();
		}
	})
}]);