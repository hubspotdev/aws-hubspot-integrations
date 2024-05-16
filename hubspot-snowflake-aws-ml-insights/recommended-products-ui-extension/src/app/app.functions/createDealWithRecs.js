const hubspot = require("@hubspot/api-client");
const axios = require("axios");

const CONFIG = {
  NEW_DEAL_PIPELINE: "default",
  NEW_DEAL_STAGE: "appointmentscheduled",
};

exports.main = async (context = {}) => {
  const PRIVATE_APP_ACCESS_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  // Initialize HubSpot API client inside the exports
  // currently the only way to get the app token auth'd locally 🤷‍♂️
  const hubspotClient = new hubspot.Client({
    accessToken: PRIVATE_APP_ACCESS_TOKEN,
  });

  const {
    hs_object_id: contactId,
    firstname,
    lastname,
    email,
  } = context.propertiesToSend;

  try {
    // 1. Get product IDs
    const productIds = await getAssociatedProductIds({
      query,
      token: PRIVATE_APP_ACCESS_TOKEN,
      contactId,
    });

    // 2. get total amount of products for deal
    const totalDealAmount = await getTotalDealAmount({
      productIds,
      hubspotClient,
    });

    // 3. create new deal
    const result = await createDeal({
      totalDealAmount,
      hubspotClient,
      firstname,
      lastname,
      email,
      contactId,
    });

    const dealId = result.id;

    // 4. attach line items of recommended products to deal
    const lineItemsResult = await createAndAssociateLineItems({
      dealId,
      productIds,
      hubspotClient,
    });

    return { status: "success", data: { id: dealId } };
  } catch (err) {
    console.error(err);
    return { status: "error" };
  }
};

/*
----
Step 1: Get IDs of products through recommended products custom object
----
*/
const getAssociatedProductIds = async ({ query, token, contactId }) => {
  const result = await getRecommendations({
    query,
    token,
    contactId,
  });

  const recommendations =
    result.data.data.CRM.contact.associations
      .p_product_recommendations_collection__product_recommendations_to_contact
      .items; // lol

  return recommendations.map(
    (recommendation) => recommendation.recommended_product_id
  );
};

const getRecommendations = async ({ query, token, contactId }) => {
  const body = {
    operationName: "GetRecommendations",
    query,
    variables: { contactId },
  };

  try {
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

const query = `
query GetRecommendations($contactId: String!) {
  CRM {
    contact(uniqueIdentifier: "hs_object_id", uniqueIdentifierValue: $contactId) {
      associations {
        p_product_recommendations_collection__product_recommendations_to_contact(orderBy: hs_createdate__desc, limit: 5) {
          items {
            recommended_product_id
          }
        }
      }
    }
  }
}`;

/*
----
Step 2: Get total deal amount from products
Necessary for deal creation
----
*/
const getTotalDealAmount = async ({ productIds, hubspotClient }) => {
  const inputs = getInputsByProductIds(productIds);

  try {
    const response = await hubspotClient.crm.products.batchApi.read({
      inputs,
      properties: ["price"],
    });

    return getTotalProductPrice(response.results);
  } catch (err) {
    throw err;
  }
};

const getInputsByProductIds = (productIds) =>
  productIds.map((productId) => ({ id: productId }));

const getTotalProductPrice = (products) =>
  products.reduce(
    (amount, result) => Number(result.properties.price) + amount,
    0
  );

/*
----
Step 3: Create new deal
----
*/

const createDeal = async ({
  totalDealAmount,
  hubspotClient,
  firstname,
  lastname,
  email,
  contactId,
}) => {
  const name = getName({ firstname, lastname, email });

  const request = {
    properties: {
      amount: totalDealAmount,
      dealstage: CONFIG.NEW_DEAL_STAGE,
      pipeline: CONFIG.NEW_DEAL_PIPELINE,
      dealname: `Product Recommendations for ${name}`,
    },
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: hubspot.AssociationTypes.dealToContact,
          },
        ],
      },
    ],
  };

  try {
    return await hubspotClient.crm.deals.basicApi.create(request);
  } catch (err) {
    throw err;
  }
};

const getName = ({ firstname, lastname, email }) => {
  if (firstname && lastname) {
    return `${firstname} ${lastname}`;
  } else if (firstname) {
    return firstname;
  } else if (lastname) {
    return lastname;
  } else if (email) {
    return email;
  } else {
    return "--";
  }
};

/*
----
Step 4: Create and associate line items
based on the recommended products
----
*/

const createAndAssociateLineItems = async ({
  dealId,
  productIds,
  hubspotClient,
}) => {
  const inputs = productIds.map((productId) => ({
    properties: {
      hs_product_id: productId,
      quantity: 1,
    },
    associations: [
      {
        to: { id: dealId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: hubspot.AssociationTypes.lineItemToDeal,
          },
        ],
      },
    ],
  }));

  try {
    return await hubspotClient.crm.lineItems.batchApi.create({ inputs });
  } catch (err) {
    throw err;
  }
};
