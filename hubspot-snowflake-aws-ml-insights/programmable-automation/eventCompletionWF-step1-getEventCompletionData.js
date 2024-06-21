/*
Workflow Custom Coded Action 1: Get HubSpot Event Completion Data and Transform it to send to AWS Personalize as Item Interactions
Notes to make this function run:
This is the first function in a HubSpot Workflow to get custom recommendations from AWS Personalize.

Makes an API call to HubSpot Event Analytics API to get recent Custom Event Completions for the contact 

Inputs:
Set variables:
1. Set HubSpot Access Token with proper scopes used by the HubSpot Workflow Custom Coded Action Secrete and used as environment variable
  - set "process.env.Token" in the workflow custom coded action secrets to be equal to your HubSpot private app token
2. Variables to get event completions
  - eventType: the HubSpot custom event ID
  - personalizeTrackingId = the ID of the Personalize event tracker from the AWS Personalize Data Set Group - available in the AWS Console

Outputs:
  A formatted response that can be sent to AWS API Gateway for Personalize Real Time APIs (as deployed by https://aws.amazon.com/solutions/implementations/maintaining-personalized-experiences-with-ml/)
*/

const hubspot = require("@hubspot/api-client");

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.Token, //add your HubSpot private app access token
  });

  //variable setup

  const objectType = "contact";
  const eventId = "pe23826378_hubspot_e_commerce_v2"; //Update to your custom event type name
  const occurredAfter = new Date(Date.now() - 180000); //all events since 3 minutes ago
  const contactId = event.object.objectId;
  const personalizeTrackingId = process.env.personalize_event_tracking_id; //event interaction tracking ID from AWS Personalize

  hubspotClient.events.eventsApi
    .getPage(objectType, eventId, occurredAfter, undefined, contactId)
    .then((results) => {
      let eventList = results.results.map((eventCompletion) => {
        return {
          eventType: eventCompletion.properties.event_type,
          itemId: eventCompletion.properties.item_id,
          sentAt: eventCompletion.occurredAt,
        };
      });
      //Event body to pass to Personalize in subsequent action
      let data = JSON.stringify({
        eventList: eventList,
        sessionId: results.results[0]["id"],
        trackingId: personalizeTrackingId,
        userId: contactId.toString(),
      });
      console.log("Data " + data);
      callback({
        outputFields: {
          CompleteEventObject: data,
        },
      });
    })
    .catch(function (error) {
      console.log("error");
      console.log(error);
    });
};
