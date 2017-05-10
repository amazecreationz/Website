const admin = require('firebase-admin');
var serviceAccount = require("./service-account.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://amazecreationz-web.firebaseio.com"
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
exports.validateToken = validateToken;

exports.validateAuth = function(authToken, callback) {
	if(authToken) {
		validateToken(authToken, callback);
	} else {
		callback(false, 'No Authorization Header found!');
	}	
}

exports.getMailCredentials = function(callback) {
	admin.database().ref('credentials').once('value', function(data) {
		callback(data.val());
	})
}

var createNewUser = function(user) {
	var userInfo = {
		name: user.name,
		email: user.email,
		image: user.picture,
		uid: user.user_id,
		permission: 3//LOGGED USER PERMISSION;
	}
	return userInfo;
}
exports.createNewUser = createNewUser;

exports.getUserInfoFromAuthenticatedUser = function(user, callback) {
	var userId = user.user_id;
	admin.database().ref('users').child(userId).once('value', function(data) {
		var userInfo = data.val();
		if(userInfo == null) {
			userInfo = createNewUser(user);
		} else {
			userInfo.image = user.picture;
		}
		admin.database().ref('users').child(userInfo.uid).set(userInfo);
		callback(userInfo);
	})
}