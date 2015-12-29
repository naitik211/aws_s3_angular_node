angular.module('awsApp', ['angularFileUpload'])
	.directive('awsS3', function() {
		return {
		    restrict: 'AE',
		    scope: '=',
		    serviceUrl: "=",
		    templateUrl: 'awsS3Template.html',
		    controller: function($scope, $element, $attrs) {
					    	
		    	var executeOnSignedUrl = function(file, callback) {
					var this_s3upload, xhr;
					this_s3upload = this;
					xhr = new XMLHttpRequest();
					xhr.open('GET', '/sign_s3' + '?s3_object_type=' + file.type + '&s3_object_name=' + 'default_name' + '&id=' + file.userId, true);
					xhr.overrideMimeType('text/plain; charset=x-user-defined');
					xhr.onreadystatechange = function(e) {
						var result;
						if (this.readyState === 4 && this.status === 200) {
							try {
								result = JSON.parse(this.responseText);
							} catch (error) {
								this_s3upload.onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
								return false;
							}
							return callback(result.signed_request, result.url, result.date);
						} else if (this.readyState === 4 && this.status !== 200) {
							return this_s3upload.onError('Could not contact request signing server. Status = ' + this.status);
						}
					};
					return xhr.send();
				};

				var createCORSRequest = function(method, url) {
					var xhr;
					xhr = new XMLHttpRequest();
					if (xhr.withCredentials !== null) {
						xhr.open(method, url, true);
					} else if (typeof XDomainRequest !== 'undefined') {
						xhr = new XDomainRequest();
						xhr.open(method, url);
					} else {
						xhr = null;
					}
					return xhr;
				};

				var uploadToS3 = function(file, url, public_url, date) {
					var this_s3upload, xhr;
					this_s3upload = this;
					xhr = createCORSRequest('PUT', url);
					if (!xhr) {
						this.onError('CORS not supported');
					} else {
						xhr.onload = function() {
							if (xhr.status === 200) {
								$scope.uploadedImage ='https://s3-us-west-1.amazonaws.com/konveau/' + Authentication.user._id + '?' + date;
								console.log('Avatar Uploaded Succsessfully');
							} else {
								console.error('Upload error: ' + xhr.status);
							}
						};
						xhr.onerror = function() {
							return this_s3upload.onError('XHR error.');
						};
						xhr.upload.onprogress = function(e) {
							var percentLoaded;
							if (e.lengthComputable) {
								percentLoaded = Math.round((e.loaded / e.total) * 100);
								$scope.uploadProgress = percentLoaded;
								$scope.$apply();
							}
						};
					}
					xhr.setRequestHeader('Content-Type', file.type);
					xhr.setRequestHeader('x-amz-acl', 'public-read');
					return xhr.send(file);
				};

				var uploadFile = function(file) {
					return executeOnSignedUrl(file, function(signedURL, publicURL, date) {
						return uploadToS3(file, signedURL, publicURL, date);
					});
				};


				$scope.onFileSelect = function(image) {
					if (image.length) {
						if (angular.isArray(image)) {
							image = image[0];
						}
						if (image.size > 5242880) {
							console.error('Image size should be less than 5 MB');
							return;
						}
						if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
							console.error('Only PNG and JPEG are accepted.');
							return;
						}
						$scope.image = image;
						$scope.uploadInProgress = true;
						$scope.uploadProgress = 0;
					}
				};
	   		}
	  	}

});