'use strict';

var express = require('express');
var app = express();
// User Routes
var awsServerCtrl = require('awsServerController');	

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Upload image to the amazone s3
app.route('/sign_s3').get(users.getSignedURL);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});