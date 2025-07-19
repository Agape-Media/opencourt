import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WaitlistNotificationEmailProps {
  email: string;
  signupTime: string;
}

export const WaitlistNotificationEmail = ({
  email,
  signupTime,
}: WaitlistNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New OpenCourt waitlist signup: {email}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>OPENCOURT</Heading>
          <Text style={tagline}>Waitlist Notification</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>New Waitlist Signup</Heading>

          <Section style={infoBox}>
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>

            <Text style={label}>Signup Time:</Text>
            <Text style={value}>{signupTime}</Text>
          </Section>

          <Text style={text}>
            A new player has joined the OpenCourt waitlist. The community
            continues to grow as we build the transparent alternative to
            corporate rating systems.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
const main = {
  backgroundColor: "#f8f9fa",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
  border: "1px solid #e1e5e9",
  borderRadius: "12px",
};

const header = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderBottom: "none",
  borderRadius: "12px 12px 0 0",
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const tagline = {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "14px",
  fontWeight: "400",
  margin: "0",
  textAlign: "center" as const,
};

const content = {
  padding: "40px 20px",
};

const h1 = {
  color: "#111113",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#64748b",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0 0 0",
};

const infoBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "24px",
  margin: "0 0 24px 0",
};

const label = {
  color: "#475569",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const value = {
  color: "#111113",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px 0",
  fontFamily: "monospace",
};

export default WaitlistNotificationEmail;
