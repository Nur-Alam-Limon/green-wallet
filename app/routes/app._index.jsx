import { useCallback, useEffect, useState } from "react";
import { json, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Card,
  Layout,
  Text,
  DataTable,
  Button,
  Box,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import indexStyles from "~/styles/main.css";
import axios from "axios";

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

  const response1 = await admin.graphql(
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
        key: "merchantid",
      },
    }
  );
  const responseJson1 = await response1.json();
  console.log("Response JSON", responseJson1);
  const data1 = responseJson1.data.shop;
  console.log("Data", data1);

  return json({ rules: data, id: data1 });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  let body = await request.formData();
  let formData = body.get("data");
  
  formData = JSON.parse(formData);

  console.log("FormData", formData);

  console.log("Session", session);

  const dataNew = await axios.post(
    `https://${session.shop}/admin/api/2024-01/metafields.json`,
    {
      metafield: {
        namespace: "green-wallet",
        key: "merchantid",
        value: JSON.stringify(formData),
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

  console.log("Metafield Data", dataNew.data.metafield);
  return json({
    id: dataNew.data,
  });
};

export default function Index() {
  const loaderData = useLoaderData();

  const [discountRules, setdiscountRules] = useState();

  const [value, setValue] = useState('');

  useEffect(() => {
    if (loaderData?.rules?.metafield?.value === undefined) {
      console.log(loaderData, "loaderData is undefined");
    } else {
      const existingRulesData = JSON.parse(loaderData?.rules?.metafield?.value);
      console.log("Loader", existingRulesData);

      setdiscountRules(existingRulesData);
      // console.log(existingRulesData?.rules);
    }
    if (loaderData?.id?.metafield?.value === undefined) {
      console.log(loaderData, "loaderData is undefined");

    } else {
      const idData = JSON.parse(loaderData?.id?.metafield?.value);
      console.log("Loader", idData?.id);

      setValue(idData?.id);
      // console.log(existingRulesData?.rules);
    }
  }, [loaderData]);

  return <ExistingRules discountRules={discountRules} value={value} setValue={setValue} />;
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

function ExistingRules({ discountRules, value, setValue }) {
  
  const submit = useSubmit();



  const handleChange = useCallback(
    (newValue) => setValue(newValue),
    [],
  );

  function handleIDSave(){
    submit(
      {
        data: JSON.stringify({
          id: value
        }),
      },
      { replace: true, method: "POST" }
    );
  }
  return (
    <Page
      title="Green Wallets App"
      
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div className="text">
              <Text as="h2" variant="headingLg">
                You need to add the app block from customizer to make the
                discount feature work. Steps to follow:
              </Text>
              <ol>
                <li>
                  Click on the "Add App Block" button which will take you to the
                  customizer.
                </li>
                <li>
                  Click on add app block at bottom and add "Green Wallets" app
                  block by selecting the app block if not done yet.
                </li>
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
            <div className="text">
              <TextField
                label="Put your Merchant ID here and hit save"
                value={value}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <p style={{ padding: "5px 0 2px", fontWeight:'400'}}>Kindly visit greenwallets.com to find your merchant id</p>
            <div className="app-block-btn">
              <Button
                size="large"
                variant="primary"
                onClick={handleIDSave}
              >
                Save
              </Button>
            </div>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            {discountRules?.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px'}}>
                  <Text as="h2" variant="headingLg">
                    Discount Conversion Rate
                  </Text>
                
                  <Button
                    size="large"
                    variant="primary"
                    url="/app/discount-config"
                  >
                    Add New Discount Convertion Rate
                  </Button>
                </div>
                <DiscountRulesTable data={discountRules} />
                
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px'}}>
                <Text as="h2" variant="headingMd">
                  No Discount conversion rules Found!
                </Text>
                
                <Button
                  size="large"
                  variant="primary"
                  url="/app/discount-config"
                >
                  Add New Discount Convertion Rate
                </Button>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
