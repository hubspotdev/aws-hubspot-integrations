/*
Workflow Custom Coded Action 4: Parse the Recommendations response from Amazon Personalize and get relevant Product data from HubSpot Product Object.
This is the fourth function in a HubSpot Workflow to parse and process Recommendations from Amazon Personalize.

Makes an API call to HubSpot Products

Inputs:
Set variables:
1. AWSPersonalizeRecommendations = Amazon Personalize Recommendations from Step 3

Outputs:
HubSpot Product information such as Name, Category, Image and External ID
*/

var axios = require("axios");

exports.main = async (event, callback) => {
  
  const _recommendations = JSON.parse(event.inputFields['AWSPersonalizeRecommendations']);
  console.log(_recommendations)
  const _contactId = event.object.objectId;
  const _objectType = "contact";
  var _filters = [];
  const _properties = ["category_level_1","category_level_2","name", "hs_images","external_id"];
  
  for (var i=0; i <= 4; i++) {
    
    var _f = {"filters": [{
            "operator": "EQ",
            "propertyName": "external_id",
            "value": _recommendations[i].itemId.toString()
        }]};
    
    _filters.push(_f);
  }
  var _search = {"filterGroups": _filters,
                 "properties": _properties
                }
  //console.log("Search " + JSON.stringify(_search));

  try {
	let config = {
      method: 'post',
      url: 'https://api.hubapi.com/crm/v3/objects/products/search',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.Token}`
    },
    data : _search
  };

  axios.request(config)
  .then(function (response) {
    //console.log(JSON.stringify(response.data));
    var _res = response.data;
    
    callback({
      outputFields: {
        ProductInfo: _res
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