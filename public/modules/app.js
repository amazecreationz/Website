'use strict'
var amazecreationz = angular.module('amazecreationz', ['ui.router', 'ngAnimate', 'ngMaterial', 'ngSanitize', 'ngCookies', 'ngFileUpload', 'restangular', 'amazecreationz.modules']);

amazecreationz.modules = angular.module('amazecreationz.modules', ['amazecreationz.widgets'])

amazecreationz.globals = {
	image: {
		root_url: '/resources/images/',
		logo_url: '/resources/images/logos/',
		gif_url: '/resources/images/gif/',
		about_url: '/resources/images/about/',
		bck_url: '/resources/images/backgrounds/',
		crew_url: '/resources/images/crew/'
	},
	cookies: {
		GPACalculator: 'gpa'
	},
	servers: {
		gpa: 'http://gpa.amazecreationz.in'
	},
	localservers: {
		gpa: 'http://localhost:9091'
	},
	loader: {
		message: 'Loading! Please Wait',
		status: 0
	},
	theme: "red"
}

amazecreationz.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
	.primaryPalette(amazecreationz.globals.theme, {
		'default': '700',
      	'hue-1': '300',
      	'hue-2': '600',
      	'hue-3': '900'
	})
	.accentPalette('red', {
		'default': '50',
		'hue-1': '50',
      	'hue-2': '50',
      	'hue-3': '50'
	});
});