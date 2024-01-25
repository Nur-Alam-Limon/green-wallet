import { json } from "@remix-run/node";
import axios from "axios";
import { authenticate, unauthenticated } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.public.appProxy(request);
  console.log("Admin", admin);
  const token = new URL(request.url).searchParams.get("token");

  console.log("Token get", token);

//   const response = await admin.graphql(
//     `#graphql
//     mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//       discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//         codeDiscountNode {
//           codeDiscount {
//             ... on DiscountCodeBasic {
//               title
//               codes(first: 10) {
//                 nodes {
//                   code
//                 }
//               }
//               startsAt
//               endsAt
//               customerSelection {
//                 ... on DiscountCustomerAll {
//                   allCustomers
//                 }
//               }
//               customerGets {
//                 value {
//                   ... on DiscountPercentage {
//                     percentage
//                   }
//                 }
//                 items {
//                   ... on AllDiscountItems {
//                     allItems
//                   }
//                 }
//               }
//               appliesOncePerCustomer
//             }
//           }
//         }
//         userErrors {
//           field
//           code
//           message
//         }
//       }
//     }`,
//     {
//       variables: {
//         basicCodeDiscount: {
//           title: "hello",
//           code: "Hello25",
//           startsAt: new Date().toISOString().split("T")[0] + "T00:00:00Z",
//           customerSelection: {
//             all: true,
//           },
//           customerGets: {
//             value: {
//               percentage: parseInt(token) / 100,
//             },
//             items: {
//               all: true,
//             },
//           },
//           appliesOncePerCustomer: true,
//         },
//       },
//     }
//   );

//   const responseJson = await response.json();
//   console.log("Fradadda", responseJson);

  return json({ data: [], date: null });
};
