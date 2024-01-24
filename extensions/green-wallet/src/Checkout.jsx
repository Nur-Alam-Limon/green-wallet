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

function Extension() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [code, setCode] = useState("");
  const [metaValue, setMetaValue] = useState([]);
  const [token, setToken] = useState(0);

  const meta = useAppMetafields({namespace : "green-wallet" ,key : "discount"});

  console.log("meta", meta[0]?.metafield?.value);

  useEffect(()=>{
    async function setRules(){
      if(meta.length>0 && metaValue.length==0){
        let x=JSON.parse(meta[0]?.metafield?.value);
        setMetaValue(x);
      }
    }
    setRules();
  },[meta])

  function handleForm() {
    console.log("hello");
    setStep(2);
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
          {(step==1) ? <Form onSubmit={() => handleForm()}>
            <View >
              <View >
                <TextField onChange={(val)=> setEmail(val)} label="Enter your Email" type="email" required />
              </View>
              <BlockSpacer spacing="base" />
              <View >
                <TextField onChange={(val)=> setPass(val)} label="Enter your Password" required />
              </View>
            <BlockSpacer spacing="base" />
            <Button appearance="monochrome" accessibilityRole="submit" spacing="base">Submit</Button>
            </View>
          </Form> : step==2 ?
          <View>
            <Text emphasis="bold" size="large">Congratulations! You have in total 550 Tokens.</Text>
            <BlockSpacer spacing="base" />
            <View>
              <Form onSubmit={() => handleToken()}>
              <TextField onChange={(val)=> setPass(val)} label="Enter how many tokens you want to use" required />
              <BlockSpacer spacing="base" />
              <Button appearance="monochrome" loading={load} accessibilityRole="submit" spacing="base">Submit</Button>
              </Form>
            </View>
          </View>
           : <>{code && 
           <View inlineAlignment="center">
            <BlockSpacer spacing="base" />
            <Heading>Promo Code: </Heading>
            <BlockSpacer spacing="base" />
            <Heading>{code}</Heading>
            <BlockSpacer spacing="base" />
            <BlockSpacer spacing="base" />
            <Text>Use Promo Code "{code}" to get $10 Off.</Text>
            <BlockSpacer spacing="base" />
           </View>
           
           }
           </>
          }
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
