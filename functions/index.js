const functions = require('firebase-functions');
const fs = require('fs');
const cors = require('cors')({origin: true});
const GPA = require('gpa-calculator');
const firebaseService = require("./firebase-service");
const GCloudService = require("./GCloudService");
const PDFParser = require("pdf2json");
var pdfParser = new PDFParser(this,1);
 
var runThroughCORS = function (request, response, responseData) {
	cors(request, response, function() {
		response.status(200).send(responseData);
		request.destroy();
	})
}

/*exports.getGradeCardData = functions.https.onRequest(function(request, response) {
	const userId = request.query.userId;
	const fileName = userId+'.pdf';
	const sourceFile = 'appData/gradecards/'+fileName;
	const destDir = '/tmp/gradecards'
	if (!fs.existsSync(destDir)){
	    fs.mkdirSync(destDir);
	}
	const destFile = destDir+'/'+fileName;
	console.log("event fired at "+ new Date())
	GCloudService.downloadFile(sourceFile, destFile, function(error) {
		console.log("downloaded at "+ new Date())
		pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    	pdfParser.on("pdfParser_dataReady", pdfData => {
    		var content = pdfParser.getRawTextContent()
    		pdfParser.on("pdfParser_dataReady", function(pdfData) {});
    		runThroughCORS(request, response, content)
    	});
    	pdfParser.loadPDF(destFile);
	});
});*/

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

/*
GPA.getStudentData(destFile, function(data) {
			if (!fs.existsSync(destFile)){
			    fs.unlinkSync(destFile);
			}
			console.log("processed at "+ new Date())
			if(data != null) {
				response.status(200).send({"hello":"how are u??"});
			}
			
			//runThroughCORS(request, response, data);
			/*firebaseService.setGradeCardData(userId, data, function(error) {
				var message = data;
				if(error) {message = error;}
				runThroughCORS(request, response, message);
			});
		});*/