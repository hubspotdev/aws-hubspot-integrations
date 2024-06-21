/*
Workflow Custom Coded Action 2: Send Transformed HubSpot Event Completion Data to AWS Personalize as Item Interactions

Notes to make this function run:
This is the second function in a HubSpot Workflow to get custom recommendations from AWS Personalize.

Makes an API call to AWS API Gateway to send Interaction data 

Inputs:
Set variables:
1. AWS API Gateway Path as a HubSpot Workflow Custom Coded Action Secret and used as environment variable or hardcode
2. DataSet Group Name from Personalize
3. AWS API Gateway API Key added as a HubSpot Workflow Custom Coded Action Secrete and used as environment variable

Set input Field from previous HubSpot coded action:
1. This function expects an input from a previous coded action. 
  The input is a properly formatted input body to send to the AWS API Gateway

Outputs:
  - Response from AWS API Gateway 

*/
var axios = require("axios");

exports.main = async (event, callback) => {
  const _completionEvent = event.inputFields["CompletionEvent"];
  console.log(_completionEvent);

  //variables to build API Gateway Path to send event completion data to Personalize
  const apiGatewayBaseUrl = process.env.apiGatewayBaseUrl;
  const personalizeDataSetGroupNamespace = "hubspot_datasetgroup";
  const apiGatewayPath = "events";
  const numResults = "5";
  const apiGatewayApiKey = process.env.personalize_api_gateway_v2;

  try {
    let config = {
      method: "post",
      url: `${apiGatewayBaseUrl}/${apiGatewayPath}/${personalizeDataSetGroupNamespace}?numResults=${numResults}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.parse(_completionEvent),
    };

    axios.defaults.headers.common = {
      "X-API-Key": apiGatewayApiKey,
    };
    axios
      .request(config)
      .then(function (response) {
        console.log("personalize response", JSON.stringify(response.data));
        var res = response.data;
        callback({
          outputFields: {
            AWSPersonalizeResponse: res,
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
