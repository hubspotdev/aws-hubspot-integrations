/*
Overview: This query unloads "Item" or "Product" training data from a HubSpot Snowflake data share into AWS S3 to then train an AWS Personalize model

Notes to customize this query:
1. Global find and replace "HUB_23826378_DB" to your Snowflake warehouse table name
2. Update the S3 Bucket URL based on the bucket created by the AWS Personalize ML OpsStack CloudFormation template
3. Follow the documentation from Snowflake on unloading data from Snowflake to S3: https://docs.snowflake.com/en/user-guide/data-unload-s3
Note: This query uses an AWS Secret Key tied to an AWS IAM User to authorize the unload into S3, not a Snowflake stage with a dedicated IAM user, which is Snowflake's recommended approach

Note on join: The query uses a LEFT OUTER JOIN to retrieve all product user interactions and the relevant product information for those interactions.
*/
COPY INTO 's3://your-s3-bucket/train/items.csv'
FROM (
    SELECT DISTINCT
        interaction.PROPERTY_ITEM_ID as ITEM_ID,
        interaction.PROPERTY_ITEM_CATEGORY_L1 as CATEGORY_L1,
        interaction.PROPERTY_ITEM_CATEGORY_L2 as CATEGORY_L2,
        REPLACE(interaction.PROPERTY_ITEM_DESCRIPTION, ',', ';') as PRODUCT_DESCRIPTION,
        REPLACE(interaction.PROPERTY_ITEM_NAME, ',', ';') as PRODUCT_NAME,
        TRY_CAST(interaction.PROPERTY_ITEM_PRICE AS STRING) as PRICE,
        product.PROPERTY_GENDER as GENDER,
        IFNULL(product.PROPERTY_PROMOTED, 'False') AS PROMOTED
    FROM HUB_23826378_DB.V2_DAILY.EVENTS_AWS_E_COMMERCE_INTERACTIONS as interaction LEFT OUTER JOIN
    HUB_23826378_DB.V2_DAILY.OBJECTS_LINE_ITEMS product ON product.PROPERTY_EXTERNAL_ID = interaction.PROPERTY_ITEM_ID
  )
  CREDENTIALS = (AWS_KEY_ID=process.env.AWS_KEY_ID AWS_SECRET_KEY=process.env.AWS_SECRET_KEY)
  FILE_FORMAT = (TYPE = CSV COMPRESSION = NONE NULL_IF=() PARSE_HEADER = TRUE)
  SINGLE = TRUE
  OVERWRITE = TRUE
  HEADER = TRUE