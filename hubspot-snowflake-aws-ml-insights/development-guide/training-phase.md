## 1\. Training Phase: Prepare Data Model in HubSpot and Connect to Snowflake for data ET

## Introduction

The foundation of a successful recommendation engine lies in the quality of data preparation. This tutorial uses HubSpot's Snowflake Data Share to facilitate data export and integration with AWS Personalize. This method allows for seamless transfer of structured interaction data from HubSpot, minimizing the use of the HubSpot REST API and accelerating development time while ensuring access to up-to-date user behavior for accurate personalization.

## Tutorial Overview

To prepare the data, you’ll follow these two steps within the first phase of this build :

- **Step 1:** Prepare the Data Model in HubSpot and Import Sample Data
- **Step 2:** Run ETL by Connecting HubSpot Operations Hub Enterprise Snowflake Data Share and Export into AWS S3

  

#### Data Representation for AWS Personalize

For deploying an eCommerce recommender system with AWS Personalize, we need to represent the data as follows:

*   Items: The products sold in the eCommerce store
*   Users: The visitors and customers to the eCommerce store
*   Interactions: Individual actions were taken by customers, such as “View,” “Add to Cart,” “Purchase”

#### HubSpot Data Model for This Tutorial

In this tutorial, we model HubSpot data using a blended approach:

*   Items: HubSpot Products (CRM Object)
*   Users: HubSpot Contacts (CRM Object)
*   Interactions:
     * Custom Event: "View" and "Add to Cart"
     * Deals: CRM Object where the stage “Checkout Completed” ("Closed Won") represents a purchased item

  

This structure allows seamless integration with AWS Personalize, providing the necessary data for accurate recommendations.

![](https://github.com/hubspotdev/aws-hubspot-integrations/blob/main/hubspot-snowflake-aws-ml-insights/assets/images/HubSpotDataModel.png)

Data Model that maps HubSpot Objects + Events to AWS Personalize Data.

## Detailed Instructions

### Step 1: Prepare Data Model in HubSpot

Data preparation flow to stage training data in HubSpot that can be exported through Snowflake into AWS

![](https://github.com/hubspotdev/aws-hubspot-integrations/blob/main/hubspot-snowflake-aws-ml-insights/assets/images/DataPrepForHS.png)

*   Download Sample Data or Use Your Own Data
*   Log in to HubSpot: Ensure you have admin access
*   Implement Data Model: Reference HubSpot Knowledge Base articles to create and edit properties:
     * [Create & Edit Properties](https://knowledge.hubspot.com/properties/create-and-edit-properties)
     * Custom Events:
          * [Import Events](https://knowledge.hubspot.com/reports/create-custom-behavioral-events-with-the-code-wizard#import-event-data)
          * [Create Events](https://knowledge.hubspot.com/reports/create-custom-behavioral-events-with-the-code-wizard#create-events-with-a-javascript-code-snippet)
     * [Import Data in HubSpot](https://knowledge.hubspot.com/import-and-export/set-up-your-import-file)

#### Create Properties

Product Properties:

*   Add Single-Line Text properties:
     * Category Level 1
     * Category Level 2
     * External ID
     * Gender 
     * Promoted

Contact Properties: 

*   Add Single-Line Text property:
     * External ID
*   Add Number property: 
     * Age

Custom Events and Properties: 

*   Create Custom Events Definition (e.g., View, Add to Cart)
     * Import Events via CSV - it is recommended to import one or more rows of [sample data](https://github.com/hubspotdev/aws-hubspot-integrations/blob/main/hubspot-snowflake-aws-ml-insights/assets/postman/custom-event-interactions-set-1.csv) to set up your Custom Event. If the Custom Event Definition is created via API then a CSV Import will not be supported.

Deal Properties: 

*   Add Single-Line Text property:
     * Cart Discount

#### Import Data via HubSpot CSV Import

**Products:**

*   Prepare Products CSV/XLS file
*   Go to Products > Import
*   Follow the import steps and map columns to HubSpot properties:
    *   Import file from computer
    *   Select “One file”
    *   Select “One object”
    *   Select “Products”
    *   Chose the CSV/XLS file
    *   Select Create New Products Only
    *   Map Columns from CSV to HubSpot Products
    *   Item\_ID → External\_ID
    *   Product\_Name → Name
    *   Category\_L1 → Category\_Level\_1
    *   Category\_L2 → Category\_Level\_2
    *   Price → Price
    *   Product\_Description → Description
    *   Gender → Gender
    *   Promoted → Promoted
    *   \[Optional\] - Folder Name → a folder where all products should be grouped by 
    *   Complete Import of Products

**Contacts:**

*   Prepare Users CSV/XLS file
*   Go to Contacts > Import
*   Follow the import steps and map columns to HubSpot properties:
    *   Import file from computer
    *   Select “One file”
    *   Select “One object”
    *   Select “Contacts”
    *   Chose the CSV/XLS file
    *   Select Create new Contacts Only
    *   Map Columns from CSV to HubSpot Contacts
    *   User\_ID → External\_ID
    *   Gender → Gender
    *   Age → Age
    *   FirstName → First\_Name
    *   LastName → Last\_Name
    *   Email → Email
    *   Complete Import of Contacts

**Event Completions:**

*   Prepare Interactions CSV/XLS file
    *   In order to map the Custom Event Completions to a HubSpot Contact record the import file requires a column called Contact ID with a valid Contact record ID. The steps below will help prepare your import file with the Contact ID column.
        *   Export a list of Contacts with columns ID and External ID where External ID is not blank to a new Microsoft Excel Worksheet
        *   Convert the interactions CSV file as a Microsoft Excel Worksheet and use existing Contact ID column
        *   Copy the contents of the Contact export into a new worksheet within the same Excel file above
        *   Create a lookup for Contact ID in the interactions worksheet which pulls the HubSpot Contact ID from the Contacts worksheet where Contact External ID matches the interactions Users ID
     
*   Import events referencing the [HubSpot Knowledge Base article](https://knowledge.hubspot.com/reports/create-custom-behavioral-events-with-the-code-wizard#import-event-data)
*   Map relevant properties:
    *   Details
        *   Event Name = E-Commerce Interactions
        *   Description = E-Commerce Interactions
        *   Associated Object = Contacts
    *   Upload
        *   Select Import File
        *   Create and Update Contacts
        *   Create new Custom event completions only
    *   Create & Map relevant String properties to support the interactions
        *   Import As Custom Event Properties
            *   Event\_Type
            *   Item\_ID
            *   Item\_Name
            *   Item\_Description
            *   Item\_Category\_L1
            *   Item\_Category\_L2
            *   Item\_Price
            *   Item\_Discount
            *   User\_ID
            *   Timestamp = map to OccurredAt
        *   Import as Contact properties
            *   Map to Record ID
        *   Complete Event Import

**Deals:**

**Deals with ‘Add to Cart’ Data:**

*   Export Products
    *   Export a list of Products with columns ID and External ID where External ID is not blank to a new Microsoft Excel Worksheet 
*   Export Contacts
    *   Export a list of Contacts with columns ID and External ID where External ID is not blank to a new Microsoft Excel Worksheet
*   Prepare Deal Import File
    *   Convert the Deals Checkout Pending CSV file as a Microsoft Excel Worksheet and use existing Product ID and Contact ID columns
    *   Copy the contents of the Product and Contact export into new worksheets within the same Excel file above
    *   Create a lookup for Contact ID in the Deals worksheet which pulls the HubSpot Contact ID from the Contacts worksheet where Contact External ID matches the Deals Users ID
    *   Create a lookup for Product ID in the Deals worksheet which pulls the HubSpot Product ID from the Products worksheet where Product External ID matches the Deals Item ID

Import Deal Data:

*   Go to Deals in HubSpot and select Import.
*   Choose "One file" and "Multiple objects".
*   Select "Deals", "Line Items", and "Contacts".
*   Choose the CSV/XLS file.
*   Select "Create new Line Items Only", "Update existing Contacts Only", and "Create new Deals Only".
*   Map the columns as follows:
    * \`Discount\` → \`Deal Properties\` → \`Cart Discount\`
    * \`Item\_Category\_L1\` → \`Line Item Properties\` → \`Category\_Level\_1\`
    * \`Item\_Category\_L2\` → \`Line Item Properties\` → \`Category\_Level\_2\`
    * \`Item\_Price\` → \`Line Item Properties\` → \`Unit Price\`
    * \`Item\_Name\` → \`Line Item Properties\` → \`Name\`
    * \`Item\_Description\` → \`Line Item Properties\` → \`Description\`
    * \`Contact\_ID\` → \`Contact Properties\` → \`Record ID\`
    * \`OccurredAt\` → \`Deal Properties\` → \`Create Date\`
    * \`Product\_ID\` → \`Line Item Properties\` → \`Product ID\`
    * \`Deal Name\` → \`Deal Properties\` → \`Deal Name\`
    *  \`Deal Pipeline\` → \`Deal Properties\` → \`Pipeline\`\`Deal Stage\` → \`Deal Properties\` → \`Deal Stage\`
    * \`Quantity\` → \`Line Item Properties\` → \`Quantity\`
    * \`OccurredAt\` → \`Deal Properties\` → \`Create Date\`
    * \`Deal Amount\` → \`Deal Properties\` → \`Amount\`
*   Complete the import.

**Deals with Purchase Data:**

*   Export Deals
    *   Export a list of Deals from HubSpot where Stage = Checkout Pending that were created in the "Add to Cart" process. Include the Deal ID, Name, Associated Contact ID.
    *   Export the Deals to a new Microsoft Excel Worksheet 
*   Export Contacts
    *   Export a list of Contacts with columns ID and External ID where External ID is not blank to a new Microsoft Excel Worksheet
*   Prepare Deal Import File
    *   Convert the Deals Checkout Completed CSV file as a Microsoft Excel Worksheet and use the existing Contact ID column
    *   Copy the contents of the Contact export into new worksheets within the same Excel file above
    *   Create a lookup for Contact ID in the Deals Checkout Completed worksheet which pulls the HubSpot Contact ID from the Contacts worksheet where Contact External ID matches the Deals Users ID
    *   Create a new column within your Deals Checkout Completed worksheet called “Deal Name” = Item Name + " " + Contact ID
    *   Copy the contents of the Deals Checkout Pending export into new worksheets within the Deal Checkout Completed file
    *   Create a new column within your Deals Checkout Pending worksheet called “Deal Name” = Deal Name + " " + Contact ID
    *   Create a Deal ID column within the Deals Checkout Completed worksheet which will be populated from the Deal ID in the Deal Checkout Pending worksheet based on the common lookup of Deal Name
    *   Use the Deal ID as the primary lookup to update existing HubSpot Deals to Checkout Completed.

*   Go to Deals in HubSpot and select Import.
*   Choose "One file" and "One object".
*   Select "Deals".
*   Choose the CSV/XLS file.
*   Select "Update existing Deals only".
*   Map the columns as follows:
    * \`Deal\_ID\` → \`Deal Properties\` → \`Record ID\`
    * \`OccurredAt\` → \`Deal Properties\` → \`Close Date\`
    * \`Deal Stage\` → \`Deal Properties\` → \`Deal Stage\`
*   Complete the import.

  

### Step 2: Train AWS Personalize: Run ETL to Export Data to AWS S3

For the AWS Personalize Training Phase we use Snowflake to export data to AWS S3. The steps below help you configure your HubSpot Snowflake integration and run queries to export HubSpot CRM and Event data from Snowflake to AWS S3. If Snowflake is not part of your technology stack and you wish to continue with the AWS Personalize Training Phase, you can utilize the [CSV data files](https://203693.fs1.hubspotusercontent-na1.net/hubfs/203693/hubspot-aws-personalize-training-data.zip) and skip to the “Launch AWS Personalize MLOps Stack” step below.

Schema mapping between HubSpot CRM and AWS Personalize

![](https://github.com/hubspotdev/aws-hubspot-integrations/blob/main/hubspot-snowflake-aws-ml-insights/assets/images/HubSpotCRMAWSPersonalizeDataMapping.png)

Data flow from HubSpot CRM to AWS through Snowflake

![](https://github.com/hubspotdev/aws-hubspot-integrations/blob/main/hubspot-snowflake-aws-ml-insights/assets/images/DataTransformationFromHSToAWS.png)


*   Enable Operations Hub Enterprise [Snowflake Data Share](https://knowledge.hubspot.com/reports/connect-snowflake-data-share)
    * **Note:** If your HubSpot Account does not have access to Operations Hub Enterprise, connect with your HubSpot Customer Success Manager, Account Executive, or [enable a trial](https://www.hubspot.com/products/operations).

#### Launch AWS Personalize MLOps Stack

*   [Create the Stack](https://docs.aws.amazon.com/solutions/latest/maintaining-personalized-experiences-with-ml/step-1.-launch-the-stack.html)
    *   Go to AWS Solution: [Maintaining Personalized Experiences with Machine Learning](https://aws.amazon.com/solutions/implementations/maintaining-personalized-experiences-with-ml/)
    *   Use [AWS CloudFormation](https://aws.amazon.com/cloudformation/) to create the stack
    *   Name your stack (e.g., "hubspot-personalize-mlops-stack")
    *   Optionally, provide a valid email address to receive MLOps notifications
*   Wait for Stack Creation
    *   The stack creation takes a few minutes
    *   Once completed (status: CREATE\_COMPLETE), note the CloudWatch Dashboard and PersonalizeBucketName from the stack outputs
*   Configure Snowflake (if using Snowflake to export data to AWS S3)
    *   Set up Snowflake to [unload data to S3](https://docs.snowflake.com/en/user-guide/data-unload-s3)
    *   Create and Test Queries
        *   Modify queries for your data warehouse and HubSpot portal
        *   Modify your Snowflake queries to point to the new S3 bucket: s3://<personalize\_bucket\_name>/train/{file\_name.csv}/
    *   Create [IAM user](https://aws.amazon.com/iam/getting-started/) in AWS and set appropriate permissions
        *   Setup the following permissions after you’ve created your IAM user:
            *   Security Credentials > Create new Access Key. Copy the Access Key ID and Secret Key (treat these keys safely!)
            *   Add a permission policy to the user that grants access to S3 - this can be done using an AWS-managed S3FullAccess policy or by creating a new policy that grants access to specific S3 buckets
*   Upload Personalize Datasets
    *   Upload your sample customer datasets (CSV format) and configuration file (JSON form [https://203693.fs1.hubspotusercontent-na1.net/hubfs/203693/config.json](https://203693.fs1.hubspotusercontent-na1.net/hubfs/203693/config.json)at) to the Personalize Bucket
    *   Export Data from HubSpot to AWS S3. Use either Snowflake or Sample CSV Files
        *   Snowflake - execute queries from the "Configure Snowflake" step above
        *   Sample CSV - upload [CSV data files](https://203693.fs1.hubspotusercontent-na1.net/hubfs/203693/hubspot-aws-personalize-training-data.zip)
    *   Example files:
        *   Interactions, Items, and Users in CSV format
        *   Data schema, event tracker, and e-commerce recommender configuration in JSON format 
*   Upload Personalize Config
    *   Download the Personalize config
    *   Upload it to the S3 bucket created by the stack
    *   The model training will begin using the provided datasets and can take a few hours (go grab a snack!)
    *   Check the training status in the AWS Personalize Data Set UI
*   Create Personalize APIs
    *   Launch the [Real-Time API CloudFormation](https://github.com/aws-samples/personalization-apis/blob/main/README.md#option-1-install-using-cloudformation-single-click-easiest) stack to create APIs
    *   These APIs will enable programmatic interaction with the Personalize Recommenders and be used in HubSpot automated workflows
