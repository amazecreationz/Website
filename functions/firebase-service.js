const admin = require('firebase-admin');
const firebase = require('firebase');

var serviceAccount = require("./service-account.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://amazecreationz-web.firebaseio.com"
});

firebase.initializeApp({
	apiKey: "AIzaSyBOutg7AYZilNdMaQr-p-15QGk-JaszRDA",
	authDomain: "amazecreationz-web.firebaseapp.com",
	databaseURL: "https://amazecreationz-web.firebaseio.com",
	projectId: "amazecreationz-web",
	storageBucket: "amazecreationz-web.appspot.com",
	messagingSenderId: "407161045317"
});

var validateToken = function(token, callback) {
	admin.auth().verifyIdToken(token).then(function(user) {
	    console.log('User Authenticated - ', user.name);
	    callback(true, user);
	}).catch(function(error) {
		console.log(error)
		callback(false, "Invalid Token");
	});
}

exports.validateAuth = function(authToken, callback) {
	if(authToken) {
		validateToken(authToken, callback);
	} else {
		callback(false, 'No Authorization Header found!');
	}	
}

exports.validateUserCredentials = function(email, pwd, callback) {
	firebase.auth().signInWithEmailAndPassword(email, pwd).then(function(data) {
		callback(true, data);
	}).catch(function(error) {
		callback(false, error);
	})
}

exports.getCustomToken = function(user, callback) {
	admin.auth().createCustomToken(user.uid).then(function(customToken) {
    	callback(customToken);
  	}).catch(function(error) {
	    callback(error);
	});
}

exports.getMailCredentials = function(callback) {
	admin.database().ref('credentials').once('value', function(data) {
		callback(data.val());
	})
}
exports.validateToken = validateToken;