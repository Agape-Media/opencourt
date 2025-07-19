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

interface WaitlistWelcomeEmailProps {
  email?: string;
}

export const WaitlistWelcomeEmail = ({
  email = "user@example.com",
}: WaitlistWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to OpenCourt - Pickleball Ratings, Reimagined</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>OPENCOURT</Heading>
          <Text style={tagline}>Transparent Pickleball for the People</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Welcome to the Community</Heading>

          <Text style={text}>
            Thank you for joining the OpenCourt waitlist. We're building the
            transparent, community-driven rating system that pickleball
            deserves.
          </Text>

          <Text style={text}>
            Corporate rating systems prioritize profit over players. Hidden
            algorithms, endless ads, and zero transparency. We're done with
            that.
          </Text>

          <Section style={features}>
            <Text style={feature}>
              Transparent: Open algorithms, no black boxes
            </Text>
            <Text style={feature}>
              Community-Driven: Built by players, shaped by feedback
            </Text>
            <Text style={feature}>
              Ad-Free Forever: Pure ratings, zero distractions
            </Text>
          </Section>

          <Text style={text}>
            OpenCourt is open source, ad-free, and built by players, for
            players. You'll be among the first to know when we launch.
          </Text>

          <Text style={text}>
            We'll keep you updated on our progress as we build honest pickleball
            ratings together.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Best regards,
            <br />
            The OpenCourt Team
          </Text>

          <Text style={footerNote}>
            You're receiving this email because you signed up for the OpenCourt
            waitlist with {email}. We'll only send you important updates about
            our launch.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#111113",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#111113",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
  background:
    "linear-gradient(135deg, #001c80 0%, #1ac7ff 25%, #04ffb1 50%, #ff1ff1 100%)",
  borderRadius: "12px 12px 0 0",
};

const logo = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const tagline = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "16px",
  fontWeight: "400",
  margin: "0",
  textAlign: "center" as const,
};

const content = {
  backgroundColor: "#1a1a1c",
  padding: "40px 20px",
  borderRadius: "0 0 12px 12px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const text = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const features = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const feature = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 12px 0",
  paddingLeft: "8px",
};

const footer = {
  padding: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const footerNote = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

export default WaitlistWelcomeEmail;
