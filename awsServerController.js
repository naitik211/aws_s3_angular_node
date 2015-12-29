'use strict';

aws = require('aws-sdk'),
AWS_ACCESS_KEY = '<your_aws_access_key>',
AWS_SECRET_KEY = '<your_aws_secret_key>',
S3_BUCKET = '<your_aws_bucket_name>';


/**
* Amazon s3 upload images.
*/
exports.getSignedURL = function (req, res) {
	aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });
	var s3 = new aws.S3(),
		fileName;
		fileName = req.user.id;
	//create params to make amazon request
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: req.query.s3_object_type,
		ACL: 'public-read'
	};
	if (req.user) {
		// Merge existing user
		User.findOneAndUpdate({_id: fileName},{updatedOn: Date.now(), isImage: true}, function(err, user) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				s3.getSignedUrl('putObject', s3_params, function(err, data){
					if (err) {
						console.log(err);
					} else {
						var return_data = {
							signed_request: data,
							url: 'https://s3.amazonaws.com/' + fileName,
							date: user.updatedOn
						};
						res.write(JSON.stringify(return_data));
						res.end();
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};