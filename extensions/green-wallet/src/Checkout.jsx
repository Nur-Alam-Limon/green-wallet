import {
  Banner,
  useApi,
  reactExtension,
  Pressable,
  Popover,
  View,
  Form,
  BlockSpacer,
  Button,
  TextField,
  Heading,
  Text,
  useAppMetafields,
  useApplyDiscountCodeChange,
  Image,
  InlineLayout,
} from "@shopify/ui-extensions-react/checkout";
import { TextBlock } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

const orderAppUrl =
  "https://loads-venue-tap-millennium.trycloudflare.com";

function Extension() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [code, setCode] = useState("");
  const [metaValue, setMetaValue] = useState([]);
  const [token, setToken] = useState(0);
  const [getToken, setGetToken] = useState(0);
  const [loadForm, setLoadForm] = useState(false);
  const [user, setUser] = useState(false);
  const [err, setErr] = useState(false);

  const applyDiscountCodeChange = useApplyDiscountCodeChange();

  const { shop } = useApi();

  const fetchData = async (val) => {
    try {
      const response = await fetch(
        `https://corsproxy.io/?${orderAppUrl}/app/extension?val=${val}&shop=${shop.myshopifyDomain}&num=2`,
        {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Fetch data call", data);
      setCode(data?.data);
    } catch (err) {
      console.error("Error fetching", err);
    }
  };

  const meta = useAppMetafields({ namespace: "green-wallet", key: "discount" });

  console.log("meta", meta[0]?.metafield?.value);

  useEffect(() => {
    async function setRules() {
      if (meta.length > 0 && metaValue.length == 0) {
        let x = JSON.parse(meta[0]?.metafield?.value);
        setMetaValue(x);
      }
    }
    setRules();
  }, [meta]);

  async function handleForm() {
    setLoadForm(true);
    if (!email || !pass) {
      setErr(true);
      setLoadForm(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let testEmail = emailRegex.test(email);

    console.log("Test Email", testEmail);

    if (!testEmail) {
      setErr(true);
      setLoadForm(false);
      return;
    }

    try {
      const response = await fetch(
        `https://corsproxy.io/?https://api.staging.greenwallets.ai/api/shopify/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: pass,
          }),
        }
      );

      const data = await response.json();
      setUser(data?.ok);
      if (data?.ok) setGetToken(parseInt(data?.result?.tokens));
      console.log("Fetch data call Green", data);
      setLoadForm(false);
      setStep(2);
    } catch (err) {
      console.error("Error fetching Green", err);
      setStep(2);
      setLoadForm(false);
    }
  }

  var retryCount = 0;
  var maxRetries = 3;
  var retryInterval = 3000; // 5 seconds

  function calculateDiscountPercentage(tokens, conversionRate) {
    let discountPercentage = tokens * conversionRate;
    console.log("Discoint", discountPercentage)

    // Ensure the discount doesn't exceed 100%
    discountPercentage = Math.min(discountPercentage, 100);
    console.log("Discoint12", discountPercentage)

    return discountPercentage;
  }

  async function handleToken() {
    setLoad(true);

    function attemptRetry() {
      console.log("Retry", retryCount, maxRetries, code);
      if (retryCount < maxRetries) {
        console.log("Retrying...");
        retryCount++;
        setTimeout(handleToken, retryInterval);
      } else {
        console.log("Exceeded maximum retry attempts");
        setLoad(false);
        setCode("");
        setStep(3);
      }
    }

    console.log("Token", metaValue);

    if (metaValue.length > 0) {
      console.log("csasacs", metaValue, typeof metaValue);

      var obj = metaValue[0];

      console.log("dsvsdv", parseInt(token), obj);

      let y = calculateDiscountPercentage(
        parseInt(token),
        parseFloat(obj.discountAmount)
      );

      console.log("UUUU",y);


      await fetchData(y);
    } else {
      console.log("hello112");
      // Retry if metaValue is empty
      attemptRetry();
      return;
    }
    setLoad(false);
    setStep(3);
  }

  function discountApply() {
    // Create a DiscountCodeAddChange or DiscountCodeRemoveChange object
    const discountCodeChange = {
      type: "addDiscountCode", // or "removeDiscountCode" based on your needs
      code: code,
    };
    applyDiscountCodeChange(discountCodeChange);
  }

  return (
    <>
      {metaValue.length == 0 ? (
        <></>
      ) : (
        <Pressable
          cornerRadius="base"
          minInlineSize="fill"
          overlay={
            <Popover minInlineSize={400} position="inlineEnd" padding="loose">
              <View inlineAlignment="center">
                <Image source="https://cdn.shopify.com/s/files/1/0635/0965/9788/files/rsz_rsz_whatsapp_image_2024-01-29_at_34350_pm-removebg-preview.png?v=1706596425" />
              </View>
              <BlockSpacer spacing="base" />
              {step == 1 ? (
                <Form onSubmit={() => handleForm()}>
                  <View>
                    <View>
                      <TextField
                        onChange={(val) => setEmail(val)}
                        label="Enter your Email"
                        type="email"
                      />
                    </View>
                    <BlockSpacer spacing="base" />
                    <View>
                      <TextField
                        onChange={(val) => setPass(val)}
                        label="Enter your Password"
                      />
                    </View>
                    <BlockSpacer spacing="base" />
                    {err && (
                      <Text appearance="critical">
                        Kindly provide correct email and pass.
                      </Text>
                    )}
                    <BlockSpacer spacing="base" />
                    <Button
                      loading={loadForm}
                      appearance="monochrome"
                      accessibilityRole="submit"
                      spacing="base"
                    >
                      Submit
                    </Button>
                  </View>
                </Form>
              ) : step == 2 ? (
                <>
                  {user ? (
                    <View>
                      <Text emphasis="bold" size="large">
                        Congratulations! You have in total {getToken} Tokens.
                      </Text>
                      <BlockSpacer spacing="base" />
                      <View>
                        <Form onSubmit={() => handleToken()}>
                          <TextField
                            onChange={(val) => setToken(val)}
                            label="Enter how many tokens you want to use"
                            required
                          />
                          <BlockSpacer spacing="base" />
                          <Button
                            appearance="monochrome"
                            loading={load}
                            accessibilityRole="submit"
                            spacing="base"
                          >
                            Submit
                          </Button>
                          <BlockSpacer spacing="base" />
                        </Form>
                      </View>
                    </View>
                  ) : (
                    <View inlineAlignment="center">
                      <Heading>Sorry! You are not a valid user.</Heading>
                      <BlockSpacer spacing="base" />
                      <Text>
                        Kindly put the email and password correctly to avail the
                        discount.
                      </Text>
                      <BlockSpacer spacing="base" />
                      <BlockSpacer spacing="base" />
                      <Button
                        to="https://staging.greenwallets.ai/"
                        inlineAlignment="center"
                        external="true"
                        appearance="monochrome"
                      >
                        Create account in Green Wallets
                      </Button>
                      <BlockSpacer spacing="base" />
                    </View>
                  )}
                </>
              ) : (
                <>
                  {code ? (
                    <View inlineAlignment="center">
                      <Heading>Promo Code: </Heading>
                      <BlockSpacer spacing="base" />
                      <Heading>{code}</Heading>
                      <BlockSpacer spacing="base" />

                      <Text>Use Promo Code "{code}" to get discount.</Text>
                      <BlockSpacer spacing="base" />
                      <Button
                        inlineAlignment="center"
                        appearance="monochrome"
                        onPress={() => discountApply()}
                      >
                        Apply Discount
                      </Button>
                      <BlockSpacer spacing="base" />
                    </View>
                  ) : (
                    <View inlineAlignment="center">
                      <Heading>Sorry!</Heading>
                      <BlockSpacer spacing="base" />
                      <Heading>No discount code found.</Heading>

                      <BlockSpacer spacing="base" />
                      <Text>Kindly try again with more tokens.</Text>
                      <BlockSpacer spacing="base" />
                      <Button
                        inlineAlignment="center"
                        appearance="monochrome"
                        onPress={() => setStep(step - 1)}
                      >
                        Go Back
                      </Button>
                      <BlockSpacer spacing="base" />
                    </View>
                  )}
                </>
              )}
            </Popover>
          }
        >
          <Banner
            status="success"
            title="Click here to get discounts from Green Wallets."
          />
        </Pressable>
      )}
    </>
  );
}
