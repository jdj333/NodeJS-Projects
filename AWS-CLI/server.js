// ===== NodeJS AWS CLI Application =====
// Description: can be used to deploy images from ECR to ECS based on a webhook trigger
// Author: James Jenkins
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var http = require("https");
const OAuth = require('oauth-1.0a');
var awsCli = require('aws-cli-js');
var Options = awsCli.Options;
var Aws = awsCli.Aws;
var app = express();
// =========================

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
    var options = new Options(
      /* accessKey    */ 'YOUR_ACCESS_KEY',
      /* secretKey    */ 'YOUR_SECRET_KEY'
    );
    var aws = new Aws(options);

    //1. Get source branch name
    var sourceBranch = jsonBody.pullrequest.source.branch.name;
    sourceBranch = sourceBranch.replace("/","_");
    console.log("EVENT: " + requestState + "\nPull Request ID: " + pullrequestID);
    var response = "";
    var ECR_Images;

    //2. Get image reference to image in ECR
    aws.command('ecr list-images --region us-west-2 --registry-id 752595945266 --repository-name ida_branches').then(function (data) {
      console.log(data.object.imageIds);
      ECR_Images = data;
      //response += "List ECR Images:\n";

      for(var i = 0; i < ECR_Images.object.imageIds.length; i++) {
        if(ECR_Images.object.imageIds[i].imageTag.includes(sourceBranch))
        {
          console.log(ECR_Images.object.imageIds[i].imageTag);
        }
      }

      //3. Deploy Docker image to ECS cluster
      //3. a. Update Task Definition to use the specified image

      //3. b. Redeploy Tasks
      // aws ecs update-service --force-new-deployment --service ecs-cluster-loadbalancer --cluster ecs-cluster


      //4. Assign subdomain using AWS Cli / Route53


      //5. Comment on the pull request the URL to the container


      res.write("Container Successfully Deployed!");
      res.end();

    });
});

app.listen(80, function() {
    console.log("Started on PORT 80");
})
