// ===== Bitbucket Webhook Application =====
// Description: Triggered by a Bitbucket pullrequest. Adds a comment on the Pullrequest.
// Author: James Jenkins
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var http = require("https");
var crypto = require('crypto')
const OAuth = require('oauth-1.0a');
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
    var response = 'API is Running';
    res.write(response);
    res.end();
});

app.post('/api/pullrequest', function(req, res) {
    var jsonBody = req.body;
    var requestState = jsonBody.pullrequest.state;
    var pullrequestID = jsonBody.pullrequest.id;
    var response = '{ "request" : "pullrequest", "state" : "' + requestState + '"}';
    var currentDate = new Date();
    var date = currentDate.getDate();
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var oauth_nonce = crypto.createHash('sha1').update(current_date + random).digest('hex');
    oauth_nonce = oauth_nonce.substring(0,11);
    var timestamp = currentDate.getTime();
    timestamp = timestamp.toString().substring(0,10);

    console.log("Pullrequest Webhook Triggered from Bitbucket. \nEVENT: " + requestState + "\nPull Request ID: " + pullrequestID);

    if(requestState == "OPEN"){
      // When the pull request is opened do this:
      console.log("Pull Request ID: " + pullrequestID);

      // Initialize OAuth
      const oauth = OAuth({
        consumer: {
          key: 'YOUR_ACCESS_KEY',
          secret: 'YOUR_SECRET_KEY'
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
          return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        }
      });

      //Replace james_jenkins and devops-testing with your group/user and project name respectively
      const request_data = {
        url: 'https://api.bitbucket.org/2.0/repositories/james_jenkins/devops-testing/pullrequests/'+pullrequestID+'/comments',
        method: 'POST'
      };

      var auth_data = oauth.authorize(request_data);
      console.log(auth_data);
      console.log(request_data);

      //Replace james_jenkins and devops-testing with your group/user and project name respectively
      var options = { method: 'POST',
        url: 'https://api.bitbucket.org/2.0/repositories/james_jenkins/devops-testing/pullrequests/'+pullrequestID+'/comments',
        qs:
         { oauth_consumer_key: auth_data.oauth_consumer_key,
           oauth_signature_method: 'HMAC-SHA1',
           oauth_timestamp: auth_data.oauth_timestamp,
           oauth_nonce: auth_data.oauth_nonce,
           oauth_version: '1.0',
           oauth_signature: auth_data.oauth_signature },
        headers:
         { 'cache-control': 'no-cache',
           'content-type': 'application/json' },
        body: { content: { raw: 'This is a comment from node!' } },
        json: true };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
      });

    } else if(requestState == "MERGED"){
      // When the pull request is merged do something...



    }

    res.write(response);
    res.end();
});

app.listen(80, function() {
    console.log("Started on PORT 80");
})
