import { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import {
  Page,
  Card,
  Layout,
  Form,
  FormLayout,
  TextField,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import axios from "axios";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  let formData = await request.formData();
  formData = formData.get("data");
  formData = JSON.parse(formData);

  console.log("FormData", formData);

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
        basicCodeDiscount: {
          title: formData?.title,
          code: formData?.discountName,
          startsAt: new Date().toISOString().split("T")[0] + "T00:00:00Z",
          customerSelection: {
            all: true,
          },
          customerGets: {
            value: {
              percentage: parseInt(formData?.discount) / 100,
            },
            items: {
              all: true,
            },
          },
          appliesOncePerCustomer: false,
        },
      },
    }
  );

  const responseJson = await response.json();

  console.log("response json", responseJson?.data?.discountCodeBasicCreate);

  if (
    responseJson?.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount
  ) {
    const dataNew = await axios.post(
      `https://${session.shop}/admin/api/2024-01/metafields.json`,
      {
        metafield: {
          namespace: "green-wallet",
          key: "discount",
          value: JSON.stringify({
            tokenQuantity: formData?.tokens,
            discountCode: formData?.discountName,
          }),
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

export default function DiscountConfig() {
  const actionData = useActionData();
  const submit = useSubmit();
  const discountCreate = actionData?.discount;

  const [title, setTitle] = useState("");
  const [discountName, setDiscountName] = useState("");
  const [tokens, setTokens] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (discountCreate?.codeDiscountNode) {
      shopify.toast.show("Discount created");
    } else if (discountCreate?.userErrors) {
      shopify.toast.show(`Error: ${discountCreate?.userErrors[0]?.message}`);
    }
  }, [discountCreate]);

  const handleTitleChange = useCallback((value) => {
    setError(false);
    setTitle(value);
  }, []);
  const handleNameChange = useCallback((value) => {
    setError(false);
    setDiscountName(value);
  }, []);
  const handleTokenChange = useCallback((value) => {
    setError(false);
    setTokens(value);
  }, []);
  const handleDiscountChange = useCallback((value) => {
    setError(false);
    setDiscount(value);
  }, []);

  function handleSave() {
    console.log("Fields", title, discountName, tokens, discount);
    if (title && discountName && tokens && discount) {
      submit(
        {
          data: JSON.stringify({
            title: title,
            discountName: discountName,
            tokens: tokens,
            discount: discount,
          }),
        },
        { replace: true, method: "POST" }
      );
    } else setError(true);
  }

  return (
    <Page
      title="Create Discount"
      backAction={{
        content: "Back",
        url: "/app",
      }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form onSubmit={handleSave}>
              <FormLayout>
                <TextField
                  value={title}
                  onChange={handleTitleChange}
                  label="Discount Title"
                  //   helpText={
                  //     <span>
                  //       We’ll use this email address to inform you on future changes to
                  //       Polaris.
                  //     </span>
                  //   }
                />
                <TextField
                  value={discountName}
                  onChange={handleNameChange}
                  label="Discount Code"
                  autoComplete="email"
                />
                <TextField
                  value={tokens}
                  onChange={handleTokenChange}
                  label="Min number of tokens"
                  type="number"
                />
                <TextField
                  value={discount}
                  onChange={handleDiscountChange}
                  label="Discount in percentage"
                  type="number"
                  min={0}
                  max={100}
                />

                {error && (
                  <p style={{ color: "red" }}>
                    Please fill out all the fields correctly.
                  </p>
                )}

                <Button submit>Create Discount</Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}