application.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){

	$stateProvider.state('home', {
		url:'/',
		templateUrl: application.globals.html.views + 'home.html',
		controller: 'HomeController'
	});

	$stateProvider.state('apps', {
		url:'/applications',
		templateUrl: application.globals.html.views + 'applications.html',
		controller: 'ApplicationsController'
	});

	$stateProvider.state('console', {
		url:'/console',
		templateUrl: application.globals.html.views + 'console.html',
		controller: 'ConsoleController'
	});

	$stateProvider.state('console.tab', {
		url:'/:tab?id=',
		templateUrl: application.globals.html.views + 'include.html',
		controller: 'ConsoleTabController'
	});

	$stateProvider.state('profile', {
		url:'/profile',
		templateUrl: application.globals.html.views + 'profile.html',
		controller: 'ProfileController'
	});

	$stateProvider.state('about', {
		url:'/about',
		templateUrl: application.globals.html.views + 'about.html',
		controller: 'AboutController'
	});

	$stateProvider.state('contact', {
		url:'/contact',
		templateUrl: application.globals.html.views + 'contact.html',
		controller: 'ContactController'
	});

	$stateProvider.state('settings', {
		url:'/settings',
		templateUrl: application.globals.html.views + 'settings.html',
		controller: 'SettingsController'
	});

	$stateProvider.state('error', {
		params: {
			url: undefined
		},
		templateUrl: application.globals.html.views + '404.html',
		controller: 'NotFoundController'
	});

	$stateProvider.state('view', {
		url:'/:type/:id?tab=&params=',
		templateUrl: application.globals.html.views + 'include.html',
		controller: 'IncludeController'
	});

	$urlRouterProvider.otherwise(function($injector, $location){
	    $injector.get('$state').go('error', {url: $location.path()});
	    return $location.path();
	});

	$locationProvider.hashPrefix('');
	$locationProvider.html5Mode(true);
}]);