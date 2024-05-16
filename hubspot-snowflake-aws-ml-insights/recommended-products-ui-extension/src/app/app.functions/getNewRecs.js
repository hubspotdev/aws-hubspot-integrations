const axios = require("axios");
const hubspot = require("@hubspot/api-client");

const CONFIG = {
  PRODUCT_RECOMMENDATION_OBJECT_ID: "2-26787156",
  PRODUCT_RECOMMENDATION_TO_CONTACT_UNLABELED_ASSOCIATION_ID: 17,
};

exports.main = async (context = {}) => {
  const PRIVATE_APP_ACCESS_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  // Initialize HubSpot API client inside the exports
  // currently the only way to get the app token auth'd locally 🤷‍♂️
  const hubspotClient = new hubspot.Client({
    accessToken: PRIVATE_APP_ACCESS_TOKEN,
  });

  const { hs_object_id: contactId } = context.propertiesToSend;

  try {
    // 1) get personalize recommendations from AWS
    const itemIds = await getPersonalizeRecommendations(contactId);

    // 2) get related HubSpot products and recommendations
    const response = await fetchProductsAndRecommendations({
      query,
      token: PRIVATE_APP_ACCESS_TOKEN,
      contactId,
      itemIds,
    });

    const recommendationIds = getRecommendationIds(
      response.data.data.CRM.contact.associations
        .p_product_recommendations_collection__product_recommendations_to_contact
        .items
    );

    const products = response.data.data.CRM.product_collection.items;

    // 3. delete old recommendations
    await deleteProductRecommedations({
      recommendationIds,
      hubspotClient,
    });

    // 4. generate new recommendations
    const result = await createAndAssociateProductRecommendations({
      contactId,
      products,
      hubspotClient,
    });

    return { status: "success" };
  } catch (err) {
    console.log(err);
    return { status: "error " };
  }
};

/*
----
Step 1: Get Latest Personalize Recommendations
----
*/
const getPersonalizeRecommendations = async (contactId) => {
  const PERSONALIZE_API_KEY = process.env["PERSONALIZE_API_KEY"];
  const PERSONALIZE_URL = process.env["PERSONALIZE_URL"];

  let data = JSON.stringify({
    userId: `${contactId}`,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: PERSONALIZE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": PERSONALIZE_API_KEY,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return getArrayOfItemIds(response.data.itemList);
  } catch (err) {
    throw err;
  }
};

const getArrayOfItemIds = (recommendations) =>
  recommendations.map((recommendation) => recommendation.itemId);

/*
----
Step 2: Get Product Info for Personalize Recommendations + current "Recommendations" custom object records
----
*/

const fetchProductsAndRecommendations = async ({
  query,
  token,
  contactId,
  itemIds,
}) => {
  const filterGroup = getFilterGroup(itemIds);

  // Set our body for the axios call
  const body = {
    operationName: "GetAssociatedObjectsAndRecommendedProducts",
    query,
    variables: { contactId, filterGroup },
  };
  try {
    // return the axios post
    return await axios.post(
      "https://api.hubapi.com/collector/graphql",
      JSON.stringify(body),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    throw err;
  }
};

const getFilterGroup = (itemIds) => ({
  OR: itemIds.map((itemId) => ({ external_id__eq: itemId })),
});

const query = `
query GetAssociatedObjectsAndRecommendedProducts($contactId: String!, $filterGroup: crm_product_filter!) {
  CRM {
    contact(uniqueIdentifier: "hs_object_id", uniqueIdentifierValue: $contactId) {
      associations {
        p_product_recommendations_collection__product_recommendations_to_contact(orderBy: hs_createdate__desc, limit: 5) {
          items {
            hs_object_id
          }
        }
      }
    }
    product_collection(filter: $filterGroup) {
      items {
        hs_object_id
        external_id
        name
        category_level_1
        category_level_2
      }
    }
  }
}
`;

const getRecommendationIds = (productRecommendations) =>
  productRecommendations.map(
    (productRecommendation) => productRecommendation.hs_object_id
  );

/*
----
Step 3: Delete old recommendations
----
*/

const deleteProductRecommedations = async ({
  recommendationIds,
  hubspotClient,
}) => {
  if (recommendationIds.length === 0) {
    return;
  }

  const inputs = recommendationIds.map((recommendationId) => ({
    id: recommendationId,
  }));

  try {
    return await hubspotClient.crm.objects.batchApi.archive(
      CONFIG.PRODUCT_RECOMMENDATION_OBJECT_ID,
      { inputs }
    );
  } catch (err) {
    throw err;
  }
};

/*
----
Step 4: Add new recommendations
----
*/

const createAndAssociateProductRecommendations = async ({
  contactId,
  products,
  hubspotClient,
}) => {
  const inputs = products.map((product) => ({
    properties: {
      recommended_product_name: product.name,
      recommended_product_id: product.hs_object_id,
      recommended_product_external_id: product.external_id,
      recommended_product_category: product.category_level_1,
      recommended_product_category_secondary: product.category_level_2,
    },
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId:
              CONFIG.PRODUCT_RECOMMENDATION_TO_CONTACT_UNLABELED_ASSOCIATION_ID,
          },
        ],
      },
    ],
  }));

  try {
    return await hubspotClient.crm.objects.batchApi.create(
      CONFIG.PRODUCT_RECOMMENDATION_OBJECT_ID,
      { inputs }
    );
  } catch (err) {
    throw err;
  }
};

/*
Product info:
{
  hs_object_id: 2683901459,
  external_id: '1d584a1e-5523-4af1-b9ef-9708bed8da39',
  name: 'Elegant White Porcelain Dinner Plates',
  category_level_1: 'housewares',
  category_level_2: 'kitchen'
}

Product recommendation property info:
{
  recommended_product_name
  recommended_product_id
  recommended_product_external_id
  recommended_product_category_secondary
  recommended_product_category
}
*/
