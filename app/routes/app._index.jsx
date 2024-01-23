import { useEffect, useState } from "react";
import { json, useLoaderData } from "@remix-run/react";
import { Page, Card, Layout, Text, DataTable } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `query ($namespace: String!, $key: String!) {
        shop {
        metafield(namespace: $namespace, key: $key) {
          value
        }
      }
      }`,
    {
      variables: {
        namespace: "green-wallet",
          key: "discount",
      },
    }
  );
  const responseJson = await response.json();
  console.log("Response JSON", responseJson);
  const data = responseJson.data.shop;
  console.log("Data", data);
  return json({ data });
};

export default function Index() {
  const loaderData = useLoaderData();

  const [discountRules, setdiscountRules] = useState();

  useEffect(() => {
    if (loaderData?.data?.metafield?.value === undefined) {
      console.log(loaderData, "loaderData is undefined");
    } else {
      const existingRulesData = JSON.parse(
        loaderData?.data?.metafield?.value
      );
      console.log("Loader", existingRulesData);

      setdiscountRules(existingRulesData);
      // console.log(existingRulesData?.rules);
    }
  }, [loaderData]);

  return (<ExistingRules discountRules={discountRules} />);
}

function DiscountRulesTable ({ data }) {
  const rows = [];
  data?.forEach((item) => {
    const MinToken=item.tokenQuantity;
    const discountCode=item.discountCode;
    

    rows.push([MinToken, discountCode]);
  });

  return (
    <DataTable
      columnContentTypes={["text", "text"]}
      headings={[
        "Min Token Quantity",
        "Discount Code",
      ]}
      rows={rows}
    />
  );
}

function ExistingRules({ discountRules }) {
  return (
    <Page
      title="Green Wallet App"
      primaryAction={{
        content: "Add New Discount",
        url: "/app/discount-config",
      }}
      // secondaryActions={
      //   <Button variant="primary" url="/app/discount-edit">
      //     Delete Existing
      //   </Button>
      // }
    >
      <Layout>
        <Layout.Section>
          <Card>
            {discountRules?.length > 0 ? (
                <>
                  <Text as="h2" variant="headingMd">
                    Existing Upsell Rules
                  </Text>
                  <DiscountRulesTable data={discountRules} />
                </>
              ) : (
            <Text as="h2" variant="headingMd">
              No Discount rules Found!
            </Text>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
