/*
Workflow Custom Coded Action 3: Get Personalized Recommendations from AWS Personalize for a HubSpot Contact
Notes to make this function run:
This is the third function in a HubSpot Workflow to get custom recommendations from AWS Personalize.

Makes an API call to AWS API Gateway for AWS Personalize Real Time APIs 

Inputs:
Set variables:
1. _apiGatewayBaseUrl = process.env.apiGatewayBaseUrl; //URL of AWS API Gateway - likely set in a previous step
2. _apiGatewayPath = "recommend-items"; // Likely do not need to change this unless you want to use a different type of pre-built Personalize recommender
3. _personalizeDataSetGroupNamespace = "hubspot_datasetgroup"; //DataSet Group Name or namespace - change this variable to your data set group, as defined in AWS Personalize Console
4. _personalizeRecommenderName = "hubspot_recommended_for_you"; //Recommender Name from specific dataset group - from the Personalize CloudFormation config file. You likely do not need to edit this unless you altered the Personalize CloudFormation config file

Outputs:
  A response personalized set of item recommendations from AWS API Gateway for Personalize Real Time APIs for the user/contact (as deployed by https://aws.amazon.com/solutions/implementations/maintaining-personalized-experiences-with-ml/)
*/

const axios = require("axios");

exports.main = async (event, callback) => {
  const _apiGatewayBaseUrl = process.env.apiGatewayBaseUrl; //URL of AWS API Gateway
  const _apiGatewayPath = "recommend-items"; //Path from Personalize Real Time API API Gateway - Likely do not need to change this
  const _personalizeDataSetGroupNamespace = "hubspot_datasetgroup"; //DataSet Group Name or namespace - change this variable to your data set group
  const _personalizeRecommenderName = "hubspot_recommended_for_you"; //Recommender Name from specific dataset group - from the Personalize CloudFormation config file
  const _userId = event.object.objectId.toString();
  const numResults = 5;

  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${_apiGatewayBaseUrl}/${_apiGatewayPath}/${_personalizeDataSetGroupNamespace}/${_personalizeRecommenderName}/${_userId}?numResults=${numResults}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios.defaults.headers.common = {
      "X-API-Key": process.env.personalize_api_gateway_v2,
    };
    axios
      .request(config)
      .then(function (response) {
        var _res = response.data;
        var _items = _res.itemList;
        console.log("items", _items);

        callback({
          outputFields: {
            AWSPersonalizeRecommendations: _items,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
};
