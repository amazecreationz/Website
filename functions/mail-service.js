const nodemailer = require('nodemailer');
const Credentials = require('./credentials');

exports.sendMail = function(headers, body, callback) {
	console.log(Credentials.username)
	var transporter = nodemailer.createTransport({
	    host: 'smtp.zoho.com',
	    port: 465,
	    secure: true,
	    auth: {
	        user: Credentials.username,
	        pass: Credentials.password
	    }
	});

	var mailOptions = {
	    from: '"Amaze Creationz" <noreply@amazecreationz.in>',
	    to: headers.to,
	    subject: headers.subject,
	    html: body,
	};

	transporter.sendMail(mailOptions, function(error, info){
	    callback(error, info);
	});
}