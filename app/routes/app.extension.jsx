import { json } from "@remix-run/node";
import { sessionStorage } from "../shopify.server";
import Shopify from "shopify-api-node";
import { LATEST_API_VERSION } from "@shopify/shopify-app-remix/server";

export const loader = async ({ request }) => {
  const val= new URL(request.url).searchParams.get("val");
  const shop = new URL(request.url).searchParams.get("shop");
  console.log("Token get", val, shop);

  let uniqueDiscountCode;

  let session = await sessionStorage.findSessionsByShop(`${shop}`);
  session = session[0];
  console.log("Sessions", session);
  if (session) {
    const admin = new Shopify({
      shopName: session?.shop,
      accessToken: session?.accessToken,
      apiVersion: LATEST_API_VERSION,
    });

    function generateDiscountCode(length = 8) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let discountCode = '';
    
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        discountCode += characters.charAt(randomIndex);
      }
    
      // You can add additional checks here to ensure the discount code is unique,
      // for example, by checking it against existing codes in your database.
    
      return discountCode;
    }
    
    // Example usage
    uniqueDiscountCode = generateDiscountCode();
    console.log("UniqueDiscountCode",uniqueDiscountCode);
    

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
        basicCodeDiscount: {
          title: "Green-Wallet",
          code: uniqueDiscountCode,
          startsAt: new Date().toISOString().split("T")[0] + "T00:00:00Z",
          customerSelection: {
            all: true,
          },
          customerGets: {
            value: {
              percentage: parseInt(val) / 100,
            },
            items: {
              all: true,
            },
          },
          appliesOncePerCustomer: false,
        },
      }
    );

    console.log("resoo", response?.discountCodeBasicCreate?.codeDiscountNode);
  }

  return json({ data: uniqueDiscountCode });
};
