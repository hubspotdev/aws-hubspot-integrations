/*
Notes to make this function run:
This is the first function in a HubSpot Workflow to get custom recommendations from AWS Personalize.

Makes an API call to HubSpot Event Analytics API to get recent Custom Event Completions for the contact 

Inputs:
Set variables:
1. Set HubSpot Access Token with proper scopes used by the HubSpot Workflow Custom Coded Action Secrete and used as environment variable
2. Variables to get event completions
- _eventType: the HubSpot custom event ID
- _personalizeTrackingId = the ID of the Personalize event tracker from the AWS Personalize Data Set Group - available in the AWS Console

Outputs:
  A formatted response that can be sent to AWS API Gateway for Personalize Real Time APIs (as deployed by https://aws.amazon.com/solutions/implementations/maintaining-personalized-experiences-with-ml/)
*/

const hubspot = require("@hubspot/api-client");

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.Token,
  });

  //variable setup

  const _objectType = "contact";
  const _eventId = "pe23826378_hubspot_e_commerce_v2"; //Update custom event type based on HubSpot portal
  const _occurredAfter = new Date(Date.now() - 180000); //all events since 3 minutes ago
  const _contactId = event.object.objectId;
  const _personalizeTrackingId = process.env.personalize_event_tracking_id; //event interaction tracking ID from AWS Personalize

  hubspotClient.events.eventsApi
    .getPage(_objectType, _eventId, _occurredAfter, undefined, _contactId)
    .then((results) => {
      let _eventList = results.results.map((eventCompletion) => {
        return {
          eventType: eventCompletion.properties.event_type,
          itemId: eventCompletion.properties.item_id,
          sentAt: eventCompletion.occurredAt,
        };
      });
      //Event body to pass to Personalize in subsequent action
      let _data = JSON.stringify({
        eventList: _eventList,
        sessionId: results.results[0]["id"],
        trackingId: _personalizeTrackingId,
        userId: _contactId.toString(),
      });
      console.log("Data " + _data);
      callback({
        outputFields: {
          CompleteEventObject: _data,
        },
      });
    })
    .catch(function (error) {
      console.log("error");
      console.log(error);
    });
};
