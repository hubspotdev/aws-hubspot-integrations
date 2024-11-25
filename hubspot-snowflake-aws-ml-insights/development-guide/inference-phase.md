## 2\. Inference Phase: Generating & Using Recommendations in HubSpot to Drive Sales

## Introduction

Once the Amazon Personalize model is operational, you can start generating and using recommendations within HubSpot. This involves adding new item interactions and users to the system and obtaining personalized suggestions for each user. These recommendations can be utilized in two key ways within HubSpot:

- **Step 3: Automating emails** that include personalized product recommendations.
- **Step 4: Creating a custom CRM card UI extension** within the smart CRM, allowing for manual generation and viewing of recommendations.

This integration enhances the user experience and equips sales and marketing teams with powerful tools to engage and convert customers.

## Tutorial Overview

This tutorial will guide you through the following steps:

- **Step 1:** Creating HubSpot Assets - Generate Recommendations in HubSpot

HubSpot Marketing Email:

*   Implement a programmable email module to handle recommendation records.
*   Ensure a dynamic population of email content with personalized recommendations.

Workflows:

*   Set up workflows to interact with AWS Real-Time Personalize APIs.
*   Automate data flow between HubSpot and AWS Personalize to keep user data and recommendations up-to-date.

User Data Integration:

*   Configure HubSpot to send new user data to AWS Personalize automatically.
*   Include all relevant user attributes for accurate personalization.

Event Tracking:

*   Track website interactions (e.g., Product Add to Cart).
*   Send interaction data from the website to HubSpot and AWS Personalize to enhance recommendation accuracy.

**Step 2:** Utilizing Recommendations - Use Recommendations in a HubSpot Custom CRM Card and Automated Email Campaigns

Triggering Email Sends:

*   Set up triggers in HubSpot to send personalized recommendation emails based on user interactions and preferences.

Custom CRM Card:

*   Develop a custom CRM card within HubSpot’s smart CRM.
*   Display personalized recommendations on the CRM card.
*   Allow sales teams to manually refresh recommendation records and attach recommendations to Deals as Line Items.

By following these steps, you can effectively generate and utilize personalized recommendations within HubSpot to drive sales and enhance customer engagement.

## Detailed Instructions

### Step 1: Creation of HubSpot Assets and Automation

#### Asset #1: Marketing Email

Use HubSpot Marketing Programmable Emails to send product recommendations from a custom object.

Marketing Email Resources:

*   [Create Marketing Emails](https://knowledge.hubspot.com/marketing-email/create-marketing-emails-in-the-drag-and-drop-email-editor)
*   [Programmable Emails](https://knowledge.hubspot.com/marketing-email/create-programmable-emails)

Create Dynamic Programmable Module:

*   In HubSpot, navigate to Design Manager under Marketing or Content
*   Create a new file of type Module
*   Set Module usage to Emails and Content Scope to Local
*   Enable Use module for programmable email
*   Add the necessary fields to your module

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfvBiR_NIrQiIGdf-rBE_GHsjkaSUcW2piMHR5HDncv7DtEVJetBsXq5EeE9N6ENDzlVXj1ew5Lc9rLCsaR1zjg5c2f9xhT6gxQK0bwefHxiKX7BmEWcxXbmm9pI7c2eQ3wowrOpbN1pXUOQ1jR9kFrJQMR?key=tS78N09clEjNowYHDX_Wxw)

*   Copy the code from GitHub and paste it into the code section
*   Save and publish the module

Create Product Recommendations Email:

*   Create a new Marketing Email of type Automated Email
*   Select the appropriate template
*   Add marketing content and personalize it using the Contact Object.
*   Insert the programmable module into the email
*   Configure settings such as Subscription Type, Subject Line, and Campaign
*   Save and publish the email

Workflow Automation:

*   Use the marketing email in your workflow automation

#### Asset #2 Custom Events

Track interactions in your web application (e-commerce, mobile, SaaS platforms) using Custom Events with AWS Personalize for Product Recommendations.

Custom Events Resources:

*   [HubSpot Tracking Code](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code) 

This allows HubSpot to monitor your website traffic

*   [Tracking Code API](https://developers.hubspot.com/docs/api/events/tracking-code) 

Leverage the Tracking Code API to identify visitors, track events, and manually track page views

*   [Custom Events](https://knowledge.hubspot.com/reports/create-custom-behavioral-events-with-the-code-wizard#create-events-with-a-javascript-code-snippet)

You can use JavaScript to track specific events that map to customer behavioral actions such as Add to Cart or Checkout

Create Custom Event:

*   Create or use an existing Custom Event that tracks e-commerce interactions
*   Add Javascript to track Add to Cart clicks
*   Copy code from GitHub and use it on your web application on the Add to Cart button.

#### Asset #3 Workflow Automation

HubSpot Workflows send CRM data to AWS Personalize in real time. Operations Hub Professional establishes the integration using programmable automation. Three workflows send User/Contact, Customer Interactions, and Purchase data from HubSpot to AWS Personalize via AWS Lambda. Recommendations from AWS Personalize are stored in a HubSpot Custom Object.

  

Workflow Resources:

*   [Workflows](https://knowledge.hubspot.com/workflows/create-workflows) & [Event based Enrollments](https://knowledge.hubspot.com/workflows/set-event-enrollment-triggers)
*   [Custom Coded Actions](https://developers.hubspot.com/docs/api/workflows/custom-code-actions)
    *   Node.js 20.x or higher
    *   Axios Library
    *   Secrets
        *   [HubSpot Private App Access Token](https://developers.hubspot.com/beta-docs/guides/apps/private-apps/overview)
        *   [AWS Lambda Authentication API Key](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)
    *   Implement code - common constants/variables utilized
        * Token - this is the HubSpot Private App Access Token. Secret Name (used) = Token
        * URL - provide the AWS Lambda Function URL to create/update Users, create Interactions, get Recommendations from AWS Personalize
        * X-API-Key - provide the AWS Lambda Authentication Key. Secret Name (used) = Personalize\_Key
        * Tracking ID - use [AWS Personalize Event Tracker](https://docs.aws.amazon.com/personalize/latest/dg/API_CreateEventTracker.html) to log Interactions
        * Custom Event Internal ID
*   [AWS Lambda Functions](https://aws.amazon.com/pm/lambda/?gclid=CjwKCAjw4ri0BhAvEiwA8oo6FzvV7CDKbMsMegz6mP7cceiAM-T_N-ukEMbU1t3RovgIyoBf4V3U5hoCXOcQAvD_BwE&trk=e0e0d4be-47fe-4336-ab69-7eece7f3d36e&sc_channel=ps&ef_id=CjwKCAjw4ri0BhAvEiwA8oo6FzvV7CDKbMsMegz6mP7cceiAM-T_N-ukEMbU1t3RovgIyoBf4V3U5hoCXOcQAvD_BwE:G:s&s_kwcid=AL!4422!3!652240143523!e!!g!!lambda%20function!19878797032!147151597893)

  

Sending HubSpot Contact Information to AWS Personalize:

*   Create a Contact-based Workflow with event-driven trigger = Object Created. Optional - add additional filters if needed to send specific Contacts
*   Enroll Contact to receive Marketing Emails via the [Manage Communication Subscription](https://knowledge.hubspot.com/records/manage-your-subscription-preferences-and-types#:~:text=Update%20the%20subscription%20status%20of%20contacts%20with%20a%20workflow) Action
*   Create a Custom Coded Action that uses the AWS Lambda Authentication Key to send Contact data to the AWS Personalize API Endpoint (PutUsers)
    *   Properties - include Contact properties to send to AWS Personalize
        *   Age
        *   Gender
    *   Copy code from GitHub and paste into the code section. 
*   \[Optional\] - copy the response from AWS Personalize in a Contact Multi-Line Text Custom Property.
*   Copy the HubSpot Contact Record ID to a custom single-line text property “External ID” via the [Copy Property Value Action](https://knowledge.hubspot.com/workflows/compatible-source-and-target-properties-for-copying-property-values-in-workflows) step

  

HubSpot Deal Checkout to AWS Personalize Integration:

*   Create a Deal based Workflow with event driven trigger = Property Value Changed. Optional - add additional filters if needed to send specific Deals.
*   Set Property Value = Deal Stage is any of Checkout Completed for a specific Deal Pipeline
*   Create a Custom Coded Action that gets the purchase data from the Deal including the Product Line Items and build the request body standardized to create Interactions Events in AWS Personalize
*   Copy code from GitHub and paste in the code section.
*   Create a Data Output String Property = CompleteEventObject
*   Create a Custom Coded Action that will send the standardized JSON request body to the AWS Personalize API Endpoint (PutEvents)
*   Use CompleteEventObject as a Property Input = CompletionEvent
*   Copy code from GitHub and paste in the code section.
*   \[Optional\] - copy the response from AWS Personalize in a Deal Multi-Line Text Custom Property.

  

Integrating HubSpot Custom Events with AWS Personalize:

*   Create a Contact based Workflow with event driven trigger = Completed a Custom Event. Optional - add additional filters if needed to send specific Contacts.
*   Create a Custom Coded Action that gets the events data from Custom Events and build the request body standardized to create Interactions Events in AWS Personalize
    *   Copy code from GitHub and paste in the code section.
    *   Create a Data Output String Property = CompleteEventObject
*   Create a Custom Coded Action that will send the standardized JSON request body to AWS Personalize API Endpoint (PutEvents)
    *   Use CompleteEventObject as a Property Input = CompletionEvent
    *   Copy code from GitHub and paste in the code section.
*   \[Optional\] - copy the response from AWS Personalize in a Deal Multi-Line Text Custom Property.
*   Add a Delay Workflow Action Step for 1 minute
*   Create a Custom Coded Action that gets the Recommendations from AWS Personalize through AWS Lambda Function
    *   Copy code from GitHub and paste in the code section.
    *   Create a Data Output String Property = AWSPersonalizeRecommendations
*   Create a Custom Coded Action that parses through the AWS Personalize Recommendations response and gets the HubSpot Product Metadata
    *   Copy code from GitHub and paste in the code section.
    *   Create a Data Output String Property = ProductInfo
*   Create a Custom Coded Action that parses through the ProductInfo from the previous step and creates Recommendations in the Product Recommendation Custom Object
    *   Use ProductInfo as a Property Input = ProductInfo
    *   Copy code from GitHub and paste in the code section.
*   Add a Delay Workflow Action Step for 1 minute
*   Use the Send Email Workflow Action Step to send the Product Recommendations Email for the Enrolled Contact

### Step 2: Use Recommendations in a HubSpot Custom CRM Card and Automated Email Campaigns

#### CRM Card Configuration

Customizing CRM is crucial for an efficient sales process, enabling reps to promptly access and act on information. In B2B eCommerce, while some sales are automated, high-value customers need direct interaction.

The personalization engine can be integrated into the CRM, allowing reps to access and act on product recommendations. HubSpot offers UI extensions (micro-apps with a React frontend and Node.js backend) to create a complete view of recommendations and take actions like opening deals and sending product recommendations with a single click.

Custom Card Resources:

*   [CRM Development Tools Overview](https://developers.hubspot.com/beta-docs/guides/crm/overview)
*   [UI Extensions with React](https://developers.hubspot.com/beta-docs/guides/crm/ui-extensions/create)
*   [UI Extensions Quickstart Guide](https://developers.hubspot.com/beta-docs/guides/crm/ui-extensions/quickstart)
*   [HubSpot UI Extensions NPM Package](https://www.npmjs.com/package/@hubspot/ui-extensions)

  

Please refer to the GitHub folder {insert path to project folder} containing the instructions and source for this Product Recommendation Card utilizing HubSpot’s UI Extensions.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcTQbDxrRRx28FDj8kQ7DvvlD0u_r1MFP1ufaN_cl5ymNndqWy3moJSxVuKYnjvwbR-JW0mQqgotdw1tTOLSH5eT33R6krWwYS_vSmfWUstzFJ_2VHJv2qaTIN62OTnYHMgQ-nbzfAtpyF3rdzq-t3OotM?key=tS78N09clEjNowYHDX_Wxw)

## Deployment
Detailed steps on deploying this solution, including code snippets and configuration settings, can be found in the respective folders and files of this repository.
