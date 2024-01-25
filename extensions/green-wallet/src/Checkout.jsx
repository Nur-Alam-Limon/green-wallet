import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Pressable,
  Popover,
  View,
  TextBlock,
  Form,
  Grid,
  BlockSpacer,
  Button,
  TextField,
  GridItem,
  BlockLayout,
  Heading,
  Text,
  useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

// const orderAppUrl='https://que-presentation-magnitude-adopted.trycloudflare.com';

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

  // const fetchData = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://corsproxy.io/?${orderAppUrl}/app/extension?token=12`,
  //       {
  //         method: "get",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }

  //     const data = await response.json();
  //     console.log("Fetch data call", data);

  //   } catch (err) {
  //     console.error("Error fetching", err);
  //   }
  // };

  const meta = useAppMetafields({ namespace: "green-wallet", key: "discount" });

  console.log("meta", meta[0]?.metafield?.value);

  // useEffect(()=>{
  //   fetchData();
  // },[])

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

    let testEmail=emailRegex.test(email);

    console.log("Test Email", testEmail);

    if(!testEmail){
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
            email: "lisben@yopmail.com",
            password: "Test@123",
          }),
        }
      );

      const data = await response.json();
      setUser(true);
      console.log("Fetch data call Green", data);
      setLoadForm(false);
      setStep(2);
    } catch (err) {
      console.error("Error fetching Green", err);
      setStep(2);
      setLoadForm(false);
    }
  }

  function handleToken() {
    setLoad(true);
    var retryCount = 0;
    var maxRetries = 5;
    var retryInterval = 5000; // 5 seconds

    function attemptRetry() {
      if (retryCount < maxRetries) {
        console.log("Retrying...");
        retryCount++;
        setTimeout(handleToken, retryInterval);
      } else {
        console.log("Exceeded maximum retry attempts");
        setLoad(false);
        setCode("No Discount Code found");
        setStep(3);
      }
    }

    console.log("Token", metaValue);

    if (metaValue.length > 0) {
      console.log("csasacs", metaValue, typeof metaValue);

      for (var i = 0; i < metaValue.length; i++) {
        var obj = metaValue[i];

        console.log("dsvsdv", parseInt(token), obj);

        if (parseInt(token) <= parseInt(obj.tokenQuantity)) {
          console.log("Condition met for object:", obj);
          setCode(obj.discountCode);
          // Perform additional actions if needed
          break; // Exit the loop when the condition is met
        }
      }
    } else {
      console.log("hello112");
      // Retry if metaValue is empty
      attemptRetry();
      return;
    }

    setStep(3);
  }

  return (
    <Pressable
      cornerRadius="base"
      minInlineSize="fill"
      overlay={
        <Popover minInlineSize={400} position="inlineEnd" padding="loose">
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
                {err && <Text appearance="critical">Kindly provide correct email and pass.</Text>}
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
                    Congratulations! You have in total 550 Tokens.
                  </Text>
                  <BlockSpacer spacing="base" />
                  <View>
                    <Form onSubmit={() => handleToken()}>
                      <TextField
                        onChange={(val) => setPass(val)}
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
                    </Form>
                  </View>
                </View>
              ) : (
                <View inlineAlignment="center">
                  <BlockSpacer spacing="base" />
                  <BlockSpacer spacing="base" />
                  <Heading>Sorry! You are not a valid user.</Heading>
                  <BlockSpacer spacing="base" />
                  <Text>
                    Kindly put the email and password correctly to avail the
                    discount.
                  </Text>
                  <BlockSpacer spacing="base" />
                  <BlockSpacer spacing="base" />
                </View>
              )}
            </>
          ) : (
            <>
              {code && (
                <View inlineAlignment="center">
                  <BlockSpacer spacing="base" />
                  <Heading>Promo Code: </Heading>
                  <BlockSpacer spacing="base" />
                  <Heading>{code}</Heading>
                  <BlockSpacer spacing="base" />
                  <BlockSpacer spacing="base" />
                  <Text>Use Promo Code "{code}" to get discount.</Text>
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
        title="Click here to get discounts from green-wallet."
      />
    </Pressable>
  );
}
