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

exports.sendNotification = function(callback) {
	var registrationToken = 'dHBeM6hGlcY:APA91bGMWn5YpTBDBqNWLhaxus55r8DTUD3ubyn-oNJ27NRUl6I0Kjqm0HhF5b5XiUW9ub6a6kEK3TzjB9nhbHtlWTC77V1hxSkEzxoBuj8uNWEif607JsFCwbkqLRd-YA612E6DjAca';
	const payload = {
      notification: {
        title: 'You have a new follower!',
        body: 'jaja is now following you.',
        icon: "https://amazecreationz.in/resources/images/logo/logo.jpg"
      }
    };
	admin.messaging().sendToDevice(registrationToken, payload).then(function(response) {
	    // See the MessagingDevicesResponse reference documentation for
	    // the contents of response.
	    console.log("Successfully sent message:", response);
	    callback(response)
	}).catch(function(error) {
	    console.log("Error sending message:", error);
	    callback(error)
	});
}

exports.setGradeCardData = function(userId, data, callback) {
	admin.database().ref('appData/GPACalculator').child(userId).child('studentData').set(data).then(function(){
		console.log("data put at "+ new Date())
		callback(null);
	}, function(error) {
		console.log("error data put at "+ new Date())
		callback(error);
	});
}