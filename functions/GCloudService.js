const gcloud = require('google-cloud');

const storage = gcloud.storage({
    projectId: 'amazecreationz-web',
    keyFilename: 'service-account.json',
});

const bucket = storage.bucket('amazecreationz-web.appspot.com');

exports.downloadFile = function(file, location, callback) {
	bucket.file(file).download({
		destination: location
	}, function(error) {
		callback(error);
	})
} 