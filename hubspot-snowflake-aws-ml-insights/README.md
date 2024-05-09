# Project #1: Custom eCommerce Recommendation Engine with HubSpot and AWS Personalize

## Overview
Unlock the power of personalized marketing and sales experiences with our comprehensive guide on integrating HubSpot’s smart CRM capabilities with AWS Personalize. This repository offers a step-by-step tutorial designed to help you create a powerful product recommendation engine tailored to enhance the customer experience, increase engagement, and boost sales.

### Context and Business Value
In the competitive eCommerce landscape, personalization is key. By implementing a recommendation engine that adapts to individual user behaviors, businesses can significantly enhance customer interactions, driving higher conversion rates and fostering loyalty.

This solution is ideal for HubSpot customers looking to leverage advanced AI/ML capabilities for personalized product recommendations directly within the HubSpot CRM, accessible by CRM users and through automated email campaigns.

### Solution Architecture
The architecture provided balances scalability with ease of deployment, suitable for HubSpot Enterprise clients. It involves key AWS services and potentially integrates with Snowflake for enhanced data handling capabilities.

## Prerequisites
- HubSpot CRM with admin permissions (Marketing Hub Enterprise, Sales Hub Enterprise, Operations Hub Enterprise)
- AWS account with permissions for:
  - AWS Personalize
  - AWS S3
  - AWS API Gateway
  - AWS Lambda
- (Optional) Access to Snowflake for using HubSpot’s Operations Hub Enterprise DataShare data

## Cost Considerations
Investing in this AI/ML powered solution can significantly boost your marketing and sales metrics. Costs involved include:
- AWS usage fees (use the [AWS Personalize Cost Calculator](https://aws.amazon.com/personalize/pricing/))
- HubSpot subscription costs
- Development expenses

## Getting Started

### Phase 1: Training Phase
1. **Prepare Data Model**: Set up your data model in HubSpot and connect to Snowflake for data ETL.
2. **Train Recommender**: Utilize the AWS Personalize to train your eCommerce recommender using data loaded into AWS S3.

### Phase 2: Inference Phase
3. **API Integration**: Develop APIs to fetch recommendations and to load new user and item interactions.
4. **Load and Utilize Recommendations**:
   - Load the generated recommendations back into HubSpot.
   - Use these recommendations through a custom CRM card and in automated email campaigns.

## Deployment
Detailed steps on deploying this solution, including code snippets and configuration settings, can be found in the respective folders and files of this repository.

## Contributing
Contributions to improve the solution are welcome. Please fork the repository, make your changes, and submit a pull request.

## Support
For support, feature requests, or bug reporting, please open an issue in this repository.

## License
[Specify the license under which this project is released]

## Contact Information
For further assistance or queries, please contact [Your Contact Information].

Thank you for choosing to enhance your eCommerce strategy with our personalized recommendation engine guide!

