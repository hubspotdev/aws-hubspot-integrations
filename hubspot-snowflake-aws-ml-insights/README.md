# Project #1: Custom eCommerce Recommendation Engine with HubSpot and AWS Personalize

Unlock the power of personalized marketing and sales experiences with our step-by-step guide on integrating HubSpot’s smart CRM and AWS Personalize.

## Context and Business Value Overview

In today's competitive eCommerce landscape, personalized product recommendations enhance customer experience and boost sales. Businesses can increase engagement, conversion rates, and customer loyalty by tailoring shopping journeys to individual user behavior.

This guide is for HubSpot prospects or customers looking to create personalized product recommendations. It provides a tutorial for building a proof-of-concept that generates recommendations in HubSpot CRM for use by sales representatives and automated email campaigns. The architecture can be adapted for other AI/ML-powered personalization use cases where HubSpot’s native AI features may not meet Enterprise needs.

The solution integrates an AI/ML recommendation engine with [HubSpot's CRM](https://www.hubspot.com/products/crm/what-is) and [AWS Personalize](https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html), balancing scalability and ease of deployment. Configuration in both AWS and HubSpot is required. The article details necessary customizations and discusses alternative architectures.

## Solution Overview

To create personalized recommendations in HubSpot for sales representatives and marketing automation campaigns, we’ll follow two phases divided into five high-level steps: Prepare, Train, Create Recommendations, and Use Recommendations.
  
**Training Phase - Train the Recommendation Engine**
*   **Step 1: Prepare Data Model** – Set up the data model in HubSpot and connect it to Snowflake for data ETL.
*   **Step 2: Train AWS Personalize** – Load HubSpot data into AWS S3 and train the AWS Personalize eCommerce Recommender, then develop APIs to retrieve recommendations and load new user and item interactions.

**Inference Phase - Generate and Use Recommendations**
*   **Step 3: Create HubSpot Assets** – Generate recommendations in HubSpot.
*   **Step 4: Utilize Recommendations** – Use the recommendations in a HubSpot custom CRM card and in automated email campaigns.

## Architecture

HubSpot eCommerce Recommendation Architecture Overview:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXckPFwNesG-WlGCQyUOxT4cxKG3XjpDk1s56_YWpLHUdbV7qAOFiEGGXcp1v8n0-oKc4RN3-EyDZE6nRQJPK0MVeRESbyKFeB9Al6Gsn9ZECRh6RjSDss-NizqJeq-bQUCLi9kJWhJ6a5y5q73O47IxRjnK?key=tS78N09clEjNowYHDX_Wxw)

## Solution Prerequisites

To build this solution, you’ll need the following accounts, services, and tools: 

1.  A [HubSpot account](https://developers.hubspot.com/docs/api/account-types) or a [developer test account](https://developers.hubspot.com/get-started).
2.  Ensure you can access the HubSpot CRM with Super Admin permissions with Marketing, Sales, or Service Hub Enterprise.
3.  This tutorial can be leveraged with a HubSpot [sandbox environment](https://developers.hubspot.com/docs/platform/crm-development-tools-overview#development-sandboxes) or production account.
4.  An [AWS account](https://portal.aws.amazon.com/billing/signup) with the following AWS services:
5.  Note: When you sign up for an AWS account, an AWS account root user is created. The root user can access all AWS services and resources in the account. Please refer to the AWS ‘[_Onboarding to AWS_](https://aws.amazon.com/getting-started/onboarding-to-aws/set-up-your-account/)’ for more information.
6.  [AWS Personalize](https://aws.amazon.com/personalize/)
7.  [Amazon S3](https://aws.amazon.com/s3/)
8.  [AWS Lambda](https://aws.amazon.com/lambda/) with an [API Gateway](https://aws.amazon.com/api-gateway/)

You can leverage an [AWS free tier](https://aws.amazon.com/free/?nc2=h_ql_pr_ft&all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all) with different free offers applicable to the services you leverage. However, refer to their [cost calculator](https://calculator.aws/#/createCalculator/personalize) to learn more about AWS Personalize costs. 

1.  A [Snowflake](https://www.snowflake.com/en/) account.

**Note:** You can leverage the free 30-day trial.

## Development Guide

Once you’ve completed the prerequisites, you can begin building a custom eCommerce recommendation engine in two phases: 

1.  **Training Phase**: Prepare Data Model in HubSpot and Connect to Snowflake for data ET
2.  **Inference Phase** - Generate and Use Recommendations

If you want to contribute to this project, see CONTRIBUTE.md for more info.

## License

\[Specify the license under which this project is released\]
