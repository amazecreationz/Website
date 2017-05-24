'use strict'
var application = angular.module('amazecreationz', ['ui.router', 'ngMaterial', 'ngSanitize', 'ngMessages', 'ngFileUpload']);

application.permissions = {
	ADMIN: 0,
	MANAGER: 1,
	BLOGGER: 2,
	USER: 3,
	VISITOR: 4
}

application.globals = {
	title: 'Amaze Creationz',
	subtitle: 'sleek solutions everywhere',
	theme: 'red',
	logo: '/resources/images/logo/logo.jpg',
	domain: 'amazecreationz.in',
	dateFormat: 'MMM dd, yyyy hh:mm a',
	feedback: {
		email: 'feedback@amazecreationz.in'
	},
	contact: {
		email: 'hey@amazecreationz.in',
		phone: '+91 80 75 688784',
		location: 'CNRA 51, Chempakasseri Nagar,<br>Kesavadasapuram, Trivandrum,<br>Kerala, India.<br>PIN: 695004',
		maps: 'https://www.google.co.in/maps/search/Amaze+Creationz'
	},
	html: {
		views: '/modules/views/',
		templates: '/modules/templates/'
	},
	images: {
		root: '/resources/images/',
		logo: '/resources/images/logo/',
		crew: '/resources/images/crew/',
		gif: '/resources/images/gif/'
	},
	developments: {
		github: 'amazecreationz'
	},
	NotFoundPage: '/modules/views/404.html'
}

application.isLive = document.domain != 'localhost'; 
//application.isLive = true;

application.mailingDomain = {
	live: "https://mail-amazecreationz.rhcloud.com",
	local: "http://localhost:3030"
}

application.firebase = {
	live: {
		functionsDomain: 'https://us-central1-amazecreationz-web.cloudfunctions.net'
	},
	local: {
		functionsDomain: 'http://localhost:8010/amazecreationz-web/us-central1'
	}
}

application.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
	.primaryPalette(application.globals.theme, {
		'default': '700',
      	'hue-1': '300',
      	'hue-2': '600',
      	'hue-3': '900'
	})
	.accentPalette(application.globals.theme, {
		'default': '50',
		'hue-1': '50',
      	'hue-2': '50',
      	'hue-3': '50'
	});
});

if(application.isLive) {
	application.firebase.current = application.firebase.live;
	application.mailingDomain.current = application.mailingDomain.live;
} else {
	application.firebase.current = application.firebase.local;
	application.mailingDomain.current = application.mailingDomain.local;
}

var printString = function(value) {
	console.log(JSON.stringify(value));
}