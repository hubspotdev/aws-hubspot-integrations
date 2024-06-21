/*
Overview: This query unloads "Users" or "Contacts" training data from a HubSpot Snowflake data share into AWS S3 to then train an AWS Personalize model

Notes to customize this query:
1. Global find and replace "HUB_23826378_DB" to your Snowflake warehouse table name
2. Update the S3 Bucket URL based on the bucket created by the AWS Personalize ML OpsStack CloudFormation template
3. Follow the documentation from Snowflake on unloading data from Snowflake to S3: https://docs.snowflake.com/en/user-guide/data-unload-s3
Note: This query uses an AWS Secret Key tied to an AWS IAM User to authorize the unload into S3, not a Snowflake stage with a dedicated IAM user, which is Snowflake's recommended approach
*/
COPY INTO 's3://your-bucket-url/train/users.csv'
FROM (
    SELECT 
        c.OBJECTID AS ID,
        c.PROPERTY_EXTERNAL_ID AS USER_ID,
        TO_VARCHAR(TO_NUMBER(c.PROPERTY_AGE)) AS AGE,
        c.PROPERTY_GENDER AS GENDER,
        c.PROPERTY_FIRSTNAME AS FIRSTNAME,
        c.PROPERTY_LASTNAME AS LASTNAME,
        c.PROPERTY_EMAIL AS EMAIL
    FROM
    HUB_23826378_DB.V2_DAILY.OBJECTS_CONTACTS c
    WHERE LENGTH(c.PROPERTY_EXTERNAL_ID) > 0
  )
  CREDENTIALS = (AWS_KEY_ID=process.env.AWS_KEY_ID AWS_SECRET_KEY=process.env.AWS_SECRET_KEY)
  FILE_FORMAT = (TYPE = CSV COMPRESSION = NONE NULL_IF=() PARSE_HEADER = TRUE)
  SINGLE = TRUE
  OVERWRITE = TRUE
  HEADER = TRUE