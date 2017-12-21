'use strict'
var application = angular.module('amazecreationz', ['ui.router', 'ngMaterial', 'ngSanitize', 'ngMessages', 'ngFileUpload']);

application.permissions = {
	ADMIN: 0,
	MANAGER: 1,
	BLOGGER: 2,
	VERIFIED_USER: 3,
	USER: 4,
	VISITOR: 5
}

application.globals = {
	title: 'Amaze Creationz',
	subtitle: 'sleek solutions everywhere',
	theme: 'blue-grey',
	logo: 'https://static.amazecreationz.in/images/logo/logo.jpg',
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
	social: {
		github: 'amazecreationz',
		facebook: 'amazecreationz',
		twitter: 'amazecreationz',
		google: '+amazecreationz',
		linkedin: 'company/amazecreationz',
		instagram: 'amazecreationz',
		youtube: 'amazecreationz'
	},
	html: {
		views: '/modules/views/',
		templates: '/modules/templates/'
	},
	styles: 'https://static.amazecreationz.in/latest/css/',
	images: {
		root: '/images/',
		thumbs: '/images/thumbs/',
		logo: '/images/logo/',
		gif: '/images/gif/',
		icons: '/images/icons/'
	},
	logo: 'https://static.amazecreationz.in/images/logo/logo-circle-250.png',
	developments: {
		github: 'amazecreationz'
	},
	NotFoundPage: '/modules/views/404.html',
	showFooter: true
}

application.isLive = document.domain != 'localhost'; 
application.isLive = true;

application.mailingDomain = {
	live: 'https://mail-amazecreationz.rhcloud.com',
	local: 'http://localhost:3030'
}

application.javaServerDomain = {
	current: 'https://javaserver-amazecreationz.rhcloud.com'
}

application.firebase = {
	live: {
		functionsDomain: 'https://us-central1-amazecreationz-web.cloudfunctions.net'
	},
	local: {
		functionsDomain: 'http://localhost:8010/amazecreationz-web/us-central1'
	}
}

application.colors = ['#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#1976D2', '#616161', '#0097A7', '#00796B', '#388E3C', '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#E64A19', '#5D4037', '#455A64']

if(application.isLive) {
	application.firebase.current = application.firebase.live;
	application.mailingDomain.current = application.mailingDomain.live;
} else {
	application.firebase.current = application.firebase.local;
	application.mailingDomain.current = application.mailingDomain.local;
}

application.config(function ($provide, $mdThemingProvider) {
	$mdThemingProvider.alwaysWatchTheme(true);
	$provide.value('$mdThemingProvider', $mdThemingProvider);
});

var printString = function(value) {
	console.log(JSON.stringify(value));
}