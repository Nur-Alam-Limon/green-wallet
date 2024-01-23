import { useEffect } from "react";
import { useActionData } from "@remix-run/react";
import { Page, Card, Layout, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {

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
            {/* {upsellRules?.length > 0 ? (
                <>
                  <Text as="h2" variant="headingMd">
                    Existing Upsell Rules
                  </Text>
                  <UpsellRulesTable data={upsellRules} />
                </>
              ) : ( */}
            <Text as="h2" variant="headingMd">
              No Discount rules Found!
            </Text>
            {/* )} */}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
