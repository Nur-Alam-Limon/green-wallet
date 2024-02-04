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
  Link,
  Modal,
} from "@shopify/ui-extensions-react/checkout";
import { TextBlock } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

const orderAppUrl =
  "https://nur-test.in.ngrok.io";

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

  const { shop,ui } = useApi();

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

    // Ensure the discount doesn't exceed 100%
    discountPercentage = Math.min(discountPercentage, 100);

    return discountPercentage;
  }

  async function handleToken() {
    setLoad(true);

    function attemptRetry() {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(handleToken, retryInterval);
      } else {
        setLoad(false);
        setCode("");
        setStep(3);
      }
    }

    if (metaValue.length > 0) {

      var obj = metaValue[0];

      let newDiscount=parseFloat(obj.discountAmount)/parseFloat(obj.tokenQuantity)

      let y = calculateDiscountPercentage(
        parseInt(token),
        parseFloat(newDiscount)
      );


      await fetchData(y);
    } else {
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
    ui.overlay.close('my-modal')
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
            // <Popover minInlineSize={400} position="inlineEnd" padding="loose">  
              <Modal
                id="my-modal"
                padding
                title=""
              >
                <View inlineAlignment="center">
                  <Image source="https://cdn.shopify.com/s/files/1/0635/0965/9788/files/rsz_whatsapp_image_2024-01-29_at_34350_pm-removebg-preview.png?v=1706983021" />
                </View>
                
                {step == 1 ? (
                  <View padding="extraLoose">
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
                      <Text>
                        Not a user?{" "}
                        <Link
                          to="https://staging.greenwallets.ai/signup"
                          appearance="monochrome"
                        >
                          Sign Up
                        </Link>
                      </Text>
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
                  </View>
                ) : step == 2 ? (
                  <>
                    {user ? (
                      <View padding="extraLoose">
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
                      <View padding="extraLoose" inlineAlignment="center">
                        <Heading>Sorry! You are not a valid user.</Heading>
                        <BlockSpacer spacing="base" />
                        <Text>
                          Kindly put the email and password correctly to avail
                          the discount.
                        </Text>
                        <BlockSpacer spacing="base" />
                        <BlockSpacer spacing="base" />
                        <Button
                          to="https://staging.greenwallets.ai/signup"
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
                      <View padding="extraLoose" inlineAlignment="center">
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
                      <View padding="extraLoose" inlineAlignment="center">
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
                {/* </Popover> */}
              </Modal>
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
