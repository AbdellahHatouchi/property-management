import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const VerifyEmail = (VerficationCode: string) => {
  return (
    <Html>
      <Head />
      <Preview>Verify Your Email for Rent Master</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={company}>Rent Master</Text>
          <Heading style={codeTitle}>Verify Your Email Address</Heading>
          <Text style={codeDescription}>
            Please enter the code below in your browser to verify your email address.
            This code will expire in 15 minutes.
          </Text>
          <Section style={codeContainer}>
            <Heading style={codeStyle}>{VerficationCode}</Heading> {/* You should dynamically generate this code */}
          </Section>
          <Text style={paragraph}>{`Didn't request this email?`}</Text>
          <Text style={paragraph}>
            If you {`didn't`} sign up for a Rent Master account, please ignore this email or contact{" "}
            <Link href="mailto:support@rent-master.com" style={link}>
              support@rent-master.com
            </Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center" as const,
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  marginTop: "20px",
  width: "480px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "12% 6%",
};

const company = {
  fontWeight: "bold",
  fontSize: "18px",
  textAlign: "center" as const,
};

const codeTitle = {
  textAlign: "center" as const,
};

const codeDescription = {
  textAlign: "center" as const,
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
  maxWidth: "100%",
};

const codeStyle = {
  color: "#000",
  display: "inline-block",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
  letterSpacing: "8px",
};

const paragraph = {
  color: "#444",
  letterSpacing: "0",
  padding: "0 40px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#444",
  textDecoration: "underline",
};
