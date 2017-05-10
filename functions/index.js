const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const firebaseService = require("./firebase-service");
 
var runThroughCORS = function (request, response, responseData) {
	cors(request, response, function() {
		response.status(200).send(responseData);
	})
}

exports.userLogin = functions.https.onRequest(function(request, response) {
	firebaseService.validateAuth(request.query.authToken, function(isAuthorised, message) {
		if(isAuthorised) {
			firebaseService.getUserInfoFromAuthenticatedUser(message, function(userInfo) {
				runThroughCORS(request, response, userInfo)
			});
		} else {
			runThroughCORS(request, response, message)
		}
	})
});