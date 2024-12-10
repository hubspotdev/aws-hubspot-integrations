/*
Workflow Custom Coded Action 5: Use the Product information from step 4 and create Recommendations within the HubSpot Product Recommendations Custom Object.
This is the fifth and final function in a HubSpot Workflow to store the HubSpot Product Recommendations.

Makes an API call to HubSpot Custom Object to create Product Recommendations

Inputs:
Set variables:
1. objectType = "2-26787156" //Set the Object ID of the newly created Product Recommendations Custom Object
2. associationTypeId = 17 //Set the association type of Contact to Recommendations object - find ID of associations at https://developers.hubspot.com/docs/api/crm/associations

Outputs:
Recommendations are stored in the Product Recommendations Product Object
*/

const hubspot = require('@hubspot/api-client');
var axios = require("axios");

exports.main = async (event, callback) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.Token
  });
  const objectType = "2-26787156"; // ID of Recommendations custom object available in URL of HS UI or at https://developers.hubspot.com/docs/api/crm/crm-custom-objects
  const associationTypeId = 17 //association type of contact to Recommendations object - find ID of associations at https://developers.hubspot.com/docs/api/crm/associations
  const _products = JSON.parse(event.inputFields['ProductInfo']);
  console.log(_products);
  const _contactId = event.object.objectId;
  var _associations = [
         {
            "types":[
               {
                  "associationCategory":"USER_DEFINED",
                  "associationTypeId": associationTypeId
               }
            ],
            "to":{
               "id":_contactId
            }
         }
      ];
 console.log(_associations)
  
  var _r = [];
  for (var i=0; i < _products.results.length; i++) {
    var _res = _products.results[i];
    var _properties = {
         "recommended_product_id":_res.id,
         "recommended_product_name":_res.properties.name,
         "recommended_product_category":_res.properties.category_level_1,
         "recommended_product_category_secondary":_res.properties.category_level_2,
         "recommended_product_external_id":_res.properties.external_id
      };
    var _record = {
      "associations": _associations,
      "properties": _properties
    };
    _r.push(_record);
  }
  
  console.log("Rec " + JSON.stringify(_r));
  
  const BatchInputSimplePublicObjectInputForCreate = { inputs: _r };

  try {
    const apiResponse = await hubspotClient.crm.objects.batchApi.create(objectType, BatchInputSimplePublicObjectInputForCreate);
  console.log(JSON.stringify(apiResponse, null, 2));
  
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
	}
     
}

