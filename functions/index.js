const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const FirebaseService = require("./firebase-service");
 
var runThroughCORS = function (request, response, responseData) {
	cors(request, response, function() {
		response.status(200).send(responseData);
		request.destroy();
	})
}

exports.createCustomToken = functions.https.onRequest(function(request, response) {
	FirebaseService.validateAuth(request.query.authToken, function(isAuthorised, message) {
		if(isAuthorised) {
			FirebaseService.getCustomToken(message, function(data) {
				runThroughCORS(request, response, data)
			});
		} else {
			runThroughCORS(request, response, message)
		}
	})
});

exports.userLogin = functions.https.onRequest(function(request, response) {
	FirebaseService.validateAuth(request.query.authToken, function(isAuthorised, message) {
		if(isAuthorised) {
			FirebaseService.getUserInfoFromAuthenticatedUser(message, function(userInfo) {
				runThroughCORS(request, response, userInfo)
			});
		} else {
			runThroughCORS(request, response, message)
		}
	})
});

exports.sendNotification = functions.https.onRequest(function(request, response) {
	FirebaseService.sendNotification(function(data) {
		runThroughCORS(request, response, data)
	})
});

