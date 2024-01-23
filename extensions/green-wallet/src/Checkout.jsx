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
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [step, setStep] = useState(1);

  function handleForm() {
    console.log("hello");
    setStep(2);
  }

  function handleToken(){
    console.log('Token');
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
            <Button accessibilityRole="submit" spacing="base">Submit</Button>
            </View>
          </Form> : step==2 ?
          <View>
            <TextBlock>Congratulations! You have in total 550 Tokens.</TextBlock>
            <BlockSpacer spacing="base" />
            <View>
              <Form onSubmit={() => handleToken()}>
              <TextField onChange={(val)=> setPass(val)} label="Enter how many tokens you want to use" required />
              <BlockSpacer spacing="base" />
              <Button accessibilityRole="submit" spacing="base">Submit</Button>
              </Form>
            </View>
          </View>
           : <View>
            <Heading>Promo Code: "DISCOUNT25"</Heading>
            <BlockSpacer spacing="base" />
            <Text>Use Promo Code "Discount25" to get $10 Off.</Text>
           </View>
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
