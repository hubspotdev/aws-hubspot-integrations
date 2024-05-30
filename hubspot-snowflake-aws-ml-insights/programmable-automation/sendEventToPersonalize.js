var axios = require("axios");

exports.main = async (event, callback) => {

  const _completionEvent = event.inputFields['CompletionEvent'];
  console.log(_completionEvent)
  
  //variables to build API Gateway Path to send event completion data to Personalize
  const _apiGatewayBaseUrl = process.env.apiGatewayBaseUrl
  const _personalizeDataSetGroupNamespace = 'hubspot_datasetgroup'
  const _apiGatewayPath = 'events'
  const _numResults = '5'
  
  try {
    
    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${_apiGatewayBaseUrl}/${_apiGatewayPath}/${_personalizeDataSetGroupNamespace}?numResults=${_numResults}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : JSON.parse(_completionEvent)
  };

  axios.defaults.headers.common = {
          "X-API-Key": process.env.personalize_api_gateway_v2,
        };
  axios.request(config)
  .then(function (response) {
    console.log('personalize response',JSON.stringify(response.data));
    var _res = response.data;
    console.log(_res)
    callback({
      outputFields: {
        AWSPersonalizeResponse: _res
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
   
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
	}
     
}

