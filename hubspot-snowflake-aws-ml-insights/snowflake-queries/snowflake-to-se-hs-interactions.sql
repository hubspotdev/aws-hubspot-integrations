/*
Overview: This query unloads "Interaction" training data from a HubSpot Snowflake data share into AWS S3 to then train an AWS Personalize model

This query creates a union data set between 2 different HubSpot data types: Custom Events and Deals. 
This is meant to represent an eCommerce model where visitors browse products, add to cart and then make a purchase

Notes to customize these queries
1. Global find and replace "HUB_23826378_DB" to your Snowflake warehouse table name
2. Update the S3 Bucket URL based on the bucket created by the AWS Personalize ML OpsStack CloudFormation template
3. Follow the documentation from Snowflake on unloading data from Snowflake to S3: https://docs.snowflake.com/en/user-guide/data-unload-s3
Note: This query uses an AWS Secret Key tied to an AWS IAM User to authorize the unload into S3, not a Snowflake stage with a dedicated IAM user, which is Snowflake's recommended approach
4. Find/Replace and Update the HubSpot Deal Stage IDs 57441672 and 57441673 for your stages that represent "Added to Cart" and "Purchased" or Closed Won
*/
COPY INTO 's3://your-s3-bucket/train/interactions.csv'
FROM (
    SELECT 
        CONCAT('INTERACTION','-', CAST(interaction.OBJECTID AS STRING)) as event_id,
        interaction.EVENTTYPEID as event_type_id, 
        interaction.OBJECTID as contact_id, 
        interaction.PROPERTY_ITEM_ID as item_id,
        interaction.PROPERTY_USER_ID as user_id,
        interaction.OCCURREDAT as event_timestamp,
        DATE_PART(epoch_second, TO_TIMESTAMP(interaction.OCCURREDAT)) as timestamp,
        interaction.PROPERTY_EVENT_TYPE as event_type,
        interaction.PROPERTY_ITEM_CATEGORY_L1 as item_category_l1,
        interaction.PROPERTY_ITEM_CATEGORY_L2 as item_category_l2,
        REPLACE(interaction.PROPERTY_ITEM_DESCRIPTION, ',', ';') as item_description,
        REPLACE(interaction.PROPERTY_ITEM_NAME, ',', ';') as item_name,
        TO_VARCHAR(TO_NUMBER(interaction.PROPERTY_ITEM_PRICE)) as item_price,
        interaction.PROPERTY_ITEM_DISCOUNT as item_discount
    FROM HUB_23826378_DB.V2_DAILY.EVENTS_AWS_E_COMMERCE_INTERACTIONS as interaction
    WHERE interaction.PROPERTY_EVENT_TYPE NOT IN ('AddToCart', 'Purchase') 
    
    UNION ALL
    
    SELECT 
        CONCAT('AddToCart','-', CAST(interaction.OBJECTID AS STRING)) as event_id,
        interaction.OBJECTTYPEID  as event_type_id, 
        contacts.OBJECTID as contact_id, 
        products.PROPERTY_EXTERNAL_ID as item_id,
        contacts.PROPERTY_EXTERNAL_ID as user_id,
        interaction.PROPERTY_CREATEDATE as event_timestamp,
        DATE_PART(epoch_second, TO_TIMESTAMP(interaction.PROPERTY_CREATEDATE)) as timestamp,
        'AddToCart' as event_type,
        products.PROPERTY_CATEGORY_LEVEL_1 as item_category_l1,
        products.PROPERTY_CATEGORY_LEVEL_2 as item_category_l2,
        REPLACE(products.PROPERTY_DESCRIPTION, ',', ';') as item_description,
        REPLACE(products.PROPERTY_NAME, ',', ';') as item_name,
        TO_VARCHAR(TO_NUMBER(products.PROPERTY_PRICE)) as item_price,
        interaction.PROPERTY_CART_DISCOUNT as item_discount
    FROM HUB_23826378_DB.V2_DAILY.OBJECTS_DEALS as interaction INNER JOIN
    HUB_23826378_DB.V2_DAILY.ASSOCIATIONS_LINE_ITEMS_TO_DEALS as interaction_product ON interaction_product.deal_objectid = interaction.objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.OBJECTS_LINE_ITEMS as products ON products.objectid = interaction_product.line_item_objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.ASSOCIATIONS_DEALS_TO_CONTACTS as interaction_contacts ON interaction_contacts.deal_objectid = interaction.objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.OBJECTS_CONTACTS as contacts ON contacts.objectid = interaction_contacts.contact_objectid
    
    WHERE interaction.property_dealstage = '57441672' AND LENGTH(products.property_category_level_1) > 0
    
    UNION ALL
    
    SELECT 
        CONCAT('Purchase','-', CAST(interaction.OBJECTID AS STRING)) as event_id,
        interaction.OBJECTTYPEID  as event_type_id, 
        contacts.OBJECTID as contact_id, 
        products.PROPERTY_EXTERNAL_ID as item_id,
        contacts.PROPERTY_EXTERNAL_ID as user_id,
        interaction.PROPERTY_CLOSEDATE as event_timestamp,
        DATE_PART(epoch_second, TO_TIMESTAMP(interaction.PROPERTY_CLOSEDATE)) as timestamp,
        'Purchase' as event_type,
        products.PROPERTY_CATEGORY_LEVEL_1 as item_category_l1,
        products.PROPERTY_CATEGORY_LEVEL_2 as item_category_l2,
        REPLACE(products.PROPERTY_DESCRIPTION, ',', ';') as item_description,
        REPLACE(products.PROPERTY_NAME, ',', ';') as item_name,
        TO_VARCHAR(TO_NUMBER(products.PROPERTY_PRICE)) as item_price,
        interaction.PROPERTY_CART_DISCOUNT as item_discount
    FROM HUB_23826378_DB.V2_DAILY.OBJECTS_DEALS as interaction INNER JOIN
    HUB_23826378_DB.V2_DAILY.ASSOCIATIONS_LINE_ITEMS_TO_DEALS as interaction_product ON interaction_product.deal_objectid = interaction.objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.OBJECTS_LINE_ITEMS as products ON products.objectid = interaction_product.line_item_objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.ASSOCIATIONS_DEALS_TO_CONTACTS as interaction_contacts ON interaction_contacts.deal_objectid = interaction.objectid INNER JOIN
    HUB_23826378_DB.V2_DAILY.OBJECTS_CONTACTS as contacts ON contacts.objectid = interaction_contacts.contact_objectid
    
    WHERE interaction.property_dealstage = '57441673' AND LENGTH(products.property_category_level_1) > 0 AND interaction.property_closedate IS NOT NULL

  )
  CREDENTIALS = (AWS_KEY_ID=process.env.AWS_KEY_ID AWS_SECRET_KEY=process.env.AWS_SECRET_KEY)
  FILE_FORMAT = (TYPE = CSV COMPRESSION = NONE NULL_IF=() PARSE_HEADER = TRUE)
  SINGLE = TRUE
  OVERWRITE = TRUE
  HEADER = TRUE
  MAX_FILE_SIZE = 4900000000