amazecreationz.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){

	$stateProvider.state('home', {
		url:'/',
		templateUrl: '/modules/pages/home.html',
		controller: 'HomeController'
	});

	$stateProvider.state('login', {
		url:'/login',
		params: {
			redirect: 'home'
		},
		templateUrl: '/modules/login/login.html',
		controller: 'LoginController'
	});

	$stateProvider.state('apps', {
		url:'/applications/:type',
		templateUrl: '/modules/applications/applications.html',
		controller: 'AppsController',
		params:  {
            type: {
				value: null,
				squash: true
        	}
        }
	});

	$stateProvider.state('crew', {
		url:'/crew',
		templateUrl: '/modules/crew.html',
		controller: 'CrewController'
	});

	$stateProvider.state('about', {
		url:'/about',
		templateUrl: '/modules/about.html',
		controller: 'AboutController'
	});

	$stateProvider.state('sitemap', {
		url:'/sitemap',
		templateUrl: '/modules/sitemap.html',
		controller: 'TabController'
	});

	$stateProvider.state('feedback', {
		url:'/feedback',
		templateUrl: '/modules/feedback.html',
		controller: 'FeedbackController'
	});

	$stateProvider.state('contact', {
		url:'/contact',
		templateUrl: '/modules/contact.html',
		controller: 'TabController'
	});

	$locationProvider.html5Mode(true);
}]);