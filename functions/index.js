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
	var email = request.query.email;
	var pwd = request.query.password;
	FirebaseService.validateUserCredentials(email, pwd, function(isAuthorised, data) {
		if(isAuthorised) {
			FirebaseService.getCustomToken(data, function(tokenData) {
				runThroughCORS(request, response, tokenData)
			});
		} else {
			runThroughCORS(request, response, data)
		}
	})
})