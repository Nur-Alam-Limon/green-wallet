import { useEffect, useState } from "react";
import { json, useLoaderData } from "@remix-run/react";
import { Page, Card, Layout, Text, DataTable, Button, Box } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import indexStyles from "~/styles/main.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

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
      const existingRulesData = JSON.parse(loaderData?.data?.metafield?.value);
      console.log("Loader", existingRulesData);

      setdiscountRules(existingRulesData);
      // console.log(existingRulesData?.rules);
    }
  }, [loaderData]);

  return <ExistingRules discountRules={discountRules} />;
}

function DiscountRulesTable({ data }) {
  const rows = [];
  data?.forEach((item) => {
    const MinToken = item.tokenQuantity;
    const discountCode = item.discountAmount + " %";

    rows.push([MinToken, discountCode]);
  });

  return (
    <DataTable
      columnContentTypes={["text", "text"]}
      headings={["Token Quantity", "Discount Percentage"]}
      rows={rows}
    />
  );
}

function ExistingRules({ discountRules }) {
  return (
    <Page
      title="Green Wallets App"
      primaryAction={{
        content: "Add New Discount Conversion Rate",
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
            <div className="text">
            <Text as="h2" variant="headingLg">
              You need to add the app block from customizer to make the discount
              feature work. Steps to follow:
              </Text>
              <ol>
                <li>Click on the "Add App Block" button which will take you to the customizer.</li>
                <li>Click on add app block at bottom and add "Green Wallets" app block by selecting the app block if not done yet.</li>
                <li>Hit save and you are good to go.</li>
              </ol>
            </div>
            <div className="app-block-btn">
            <Button
          
              size="large"
              variant="primary"
              onClick={() => {
                window.open(
                  `https://admin.shopify.com/store/green-wallet-test/settings/checkout/editor`,
                  "_blank"
                );
              }}
            >
              Add App Block
            </Button>
            </div>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            {discountRules?.length > 0 ? (
              <>
                <Text as="h2" variant="headingLg">
                  Discount Conversion Rate
                </Text>
                <DiscountRulesTable data={discountRules} />
              </>
            ) : (
              <Text as="h2" variant="headingMd">
                No Discount conversion rules Found!
              </Text>
            )}
          </Card>
        </Layout.Section>
        
      </Layout>
    </Page>
  );
}
