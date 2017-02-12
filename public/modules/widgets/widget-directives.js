amazecreationz.widgets = angular.module('amazecreationz.widgets' ,[])


/*
widget: Loader Widget
data: Containes loader object {
	message: Message to be displayed
	status: Hidden state = 0, Show = 1
}
*/
amazecreationz.widgets.directive('loader', [function() {
	return {
		restrict:'E',
		scope: {
			data: '='
		},
		templateUrl: '/modules/widgets/loader.html',
		link: function (scope, elements, attributes) {
			var setLoader = function(){
				$('body').addClass('flow');
			}

			var removeLoader = function(){
				$('body').removeClass('flow');
			}

			scope.$watch('data.status', function(status){
				scope.status = status;
				if(status == 1){
					setLoader();
				}
				else{
					removeLoader();
				}
			})

			scope.$watch('data.message', function(message){
				scope.message = message;
			})
		}
	}
}]);



/*
widget: Application Card
app: Application Info Object
*/
amazecreationz.widgets.directive('appCard', ['$state', function($state) {
	return {
		restrict:'E',
		scope: {
			app: '='
		},
		templateUrl: '/modules/widgets/app-card.html',
		link: function (scope, elements, attributes) {
			scope.gotoPage =  function(appId) {
				$state.go('apps', {type: appId});
			}
		}
	}
}]);




/*
widget: Tags
tagdata: Tags Info Object
*/
amazecreationz.widgets.directive('tags', ['$state', function($state) {
	return {
		restrict:'E',
		scope: {
			tagdata: '='
		},
		template: "<span ng-repeat=\"tag in tagdata | orderBy : 'priority' : true\" style='background-color: {{tag.color}}; padding: 5px; color: #FFF'>{{tag.title}}</span>",
		link: function (scope, elements, attributes) {

		}
	}
}]);




/*
widget: Get from Play Store
link: playstore link
height: (optional) height of image - default height: 30px
*/
amazecreationz.widgets.directive('googlePlay', ['$state', function($state) {
	return {
		restrict:'E',
		scope: {
			link: '@',
			height: '@'
		},
		template: '<a href="{{link}}" target="_blank"><img alt="Get it on Google Play" ng-style="imgClass" src="/resources/images/google-play-badge.png"/></a>',
		link: function (scope, elements, attributes) {
			if(angular.isUndefined(scope.height)){
				scope.imgClass={
					'height': '30px',
					'width': 'auto'
				};
			}
			else {
				scope.imgClass={
					'height': scope.height,
					'width': 'auto'
				};
			}
		}
	}
}]);




/*
widget: Crew Card
crewInfo: Crew Info Object
*/
amazecreationz.widgets.directive('crewCard', ['$state', function($state) {
	return {
		restrict:'E',
		scope: {
			crewInfo: '='
		},
		templateUrl: '/modules/widgets/crew-card.html',
		link: function (scope, elements, attributes) {
			scope.image_url = amazecreationz.globals.image.crew_url + (angular.isDefined(scope.crewInfo.image_url) ? scope.crewInfo.image_url : 'logo.png');
		}
	}
}]);

/*
widget: Chart Widget
chartData: Chart Data Object
*/
amazecreationz.widgets.directive('chart', ['$state', function($state) {
	return {
		restrict:'E',
		scope: {
			chartData: '='
		},
		replace: true,
		template: '<canvas class="chart-container"></canvas>',
		link: function (scope, elements, attributes) {
			var chartElement = elements[0].getContext("2d");
			var chart = new Chart(chartElement, scope.chartData);
			scope.$watch('chartData', function(data){
				if(data != undefined){
					data.options = setBasicOptions(data.type);
					chart.destroy();
					chart = new Chart(chartElement, data);
				}
			})
		}
	}
}]);