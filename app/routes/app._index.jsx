import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import {
  Page,
  Card,
  Layout,
  Text
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import axios from "axios";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  console.log("Session", session);

  const response = await admin.graphql(
    `#graphql
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              appliesOncePerCustomer
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }`,
    {
      variables: {
        "basicCodeDiscount": {
          "title": "17% off all items",
          "code": "DISCOUNT17",
          "startsAt": new Date().toISOString().split('T')[0] + 'T00:00:00Z',
          "customerSelection": {
            "all": true
          },
          "customerGets": {
            "value": {
              "percentage": 0.2
            },
            "items": {
              "all": true
            }
          },
          "appliesOncePerCustomer": false
        }
      },
    },
  );

  const responseJson = await response.json();

  console.log('response json', responseJson?.data?.discountCodeBasicCreate);

  if(responseJson?.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount){

    const dataNew = await axios.post(
      `https://${session.shop}/admin/api/2024-01/metafields.json`,
      {
        metafield: {
          namespace: "green-wallet",
          key: "discount",
          value: JSON.stringify(responseJson?.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount),
          type: "json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session?.accessToken,
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    );

    console.log("Metafield Data", dataNew.data);
  }

  return json({
    discount: responseJson?.data?.discountCodeBasicCreate,
  });
};

export default function Index() {
  const actionData = useActionData();
  const submit = useSubmit();
  const discountCreate = actionData?.discount;


  useEffect(() => {
    if (discountCreate?.codeDiscountNode) {
      shopify.toast.show("Discount created");
    } else if(discountCreate?.userErrors){
      shopify.toast.show(`Error: ${discountCreate?.userErrors[0]?.message}`);
    }
  }, [discountCreate]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

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
