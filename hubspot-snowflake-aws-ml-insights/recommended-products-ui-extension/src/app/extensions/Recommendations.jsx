import { useMemo, useState } from "react";
import {
  Divider,
  hubspot,
  Button,
  Dropdown,
  Alert,
  Link,
  LoadingSpinner,
} from "@hubspot/ui-extensions";
import { CrmAssociationTable } from "@hubspot/ui-extensions/crm";

const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  COMPLETE: "COMPLETE",
  FAILED: "FAILED",
};

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Recommendations
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    refreshObjectProperties={actions.refreshObjectProperties}
  />
));

const Recommendations = ({
  context,
  runServerless,
  sendAlert,
  refreshObjectProperties,
}) => {
  // todo: move to STATUS pattern
  const [dealLoading, setDealLoading] = useState(false);
  const [newDealId, setNewDealId] = useState(0);

  const [recommendationRefreshStatus, setRecommendationRefreshStatus] =
    useState(STATUS.NOT_STARTED);

  const [emailSendStatus, setEmailSendStatus] = useState(STATUS.NOT_STARTED);

  const handleRefreshRecommendations = async () => {
    setRecommendationRefreshStatus(STATUS.PENDING);
    const { response } = await runServerless({
      name: "getNewRecs",
      propertiesToSend: ["hs_object_id"],
    });
    refreshObjectProperties();
    if (response.status === "success") {
      setRecommendationRefreshStatus(STATUS.COMPLETE);
    } else if (response.status === "error") {
      setRecommendationRefreshStatus(STATUS.FAILED);
      sendAlert({
        type: "danger",
        message:
          "Something went wrong. Please examine the project app logs for more information.",
      });
    }
  };

  const handleDealCreate = async () => {
    setDealLoading(true);
    const { response } = await runServerless({
      name: "createDealWithRecs",
      propertiesToSend: ["hs_object_id", "firstname", "lastname", "email"],
    });
    refreshObjectProperties(); // don't think this will update associated deals in the right sidebar
    setDealLoading(false);
    if (response.status === "success") {
      setNewDealId(response.data.id);
    } else if (response.status === "error") {
      sendAlert({
        type: "danger",
        message:
          "Something went wrong. Please examine the project app logs for more information.",
      });
    }
  };

  const handleSingleSendEmail = async () => {
    setEmailSendStatus(STATUS.PENDING);
    const { response } = await runServerless({
      name: "sendRecsEmail",
      propertiesToSend: ["email"],
    });
    if (response.status === "success") {
      setEmailSendStatus(STATUS.COMPLETE);
    } else if (response.status === "error") {
      setEmailSendStatus(STATUS.FAILED);
      sendAlert({
        type: "danger",
        message:
          "Something went wrong. Please examine the project app logs for more information.",
      });
    }
  };

  const dealLink = useMemo(
    () =>
      `https://app.hubspot.com/contacts/${context.portal.id}/record/0-3/${newDealId}`,
    [context.portal.id, newDealId]
  );

  // todo: sub-components
  return (
    <>
      {dealLoading === true ? (
        <LoadingSpinner
          label="Creating a deal with products..."
          showLabel={true}
        />
      ) : null}
      {recommendationRefreshStatus === STATUS.PENDING ? (
        <LoadingSpinner
          label="Refreshing recommendations..."
          showLabel={true}
        />
      ) : null}
      {emailSendStatus === STATUS.PENDING ? (
        <LoadingSpinner label="Sending email..." showLabel={true} />
      ) : null}
      {newDealId !== 0 ? (
        <Alert title="New Deal Created" variant="success">
          <Link href={dealLink}>Click here</Link> to view it.
        </Alert>
      ) : null}
      {recommendationRefreshStatus === STATUS.COMPLETE ? (
        <Alert title="Recommendations Refreshed" variant="success">
          The latest product recommendations have been populated in HubSpot.
        </Alert>
      ) : null}
      {emailSendStatus === STATUS.COMPLETE ? (
        <Alert title="Email Sent" variant="success">
          Check the activity timeline of the contact for email updates!
        </Alert>
      ) : null}
      {newDealId !== 0 ||
      dealLoading ||
      recommendationRefreshStatus === STATUS.PENDING ||
      recommendationRefreshStatus === STATUS.COMPLETE ||
      emailSendStatus === STATUS.PENDING ||
      emailSendStatus === STATUS.COMPLETE ? (
        <Divider />
      ) : null}
      <CrmAssociationTable
        objectTypeId="2-26787156"
        propertyColumns={[
          "recommended_product_name",
          "hs_createdate",
          "recommended_product_category",
        ]}
        searchable={false}
        pagination={true}
      />
      <Divider />
      <Button
        onClick={handleRefreshRecommendations}
        variant="primary"
        size="md"
        type="button"
      >
        Refresh Recommendations
      </Button>
      <Dropdown
        options={[
          {
            label: "Create new deal",
            onClick: handleDealCreate,
          },
          {
            label: "Email recommended products",
            onClick: handleSingleSendEmail,
          },
        ]}
        variant="secondary"
        buttonSize="md"
        buttonText="Actions"
      />
    </>
  );
};
