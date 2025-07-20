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
} from '@react-email/components';

interface WaitlistLaunchEmailProps {
  email?: string;
}

export const WaitlistLaunchEmail = ({
  email = 'user@example.com',
}: WaitlistLaunchEmailProps) => (
  <Html>
    <Head />
    <Preview>
      OpenCourt is Live - Your Transparent Pickleball Rating System
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>OPENCOURT</Heading>
          <Text style={tagline}>Transparent Pickleball for the People</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>The Wait is Over!</Heading>

          <Text style={text}>
            OpenCourt is officially live! Thank you for being part of our
            waitlist community. You believed in transparent, community-driven
            pickleball ratings from day one.
          </Text>

          <Text style={text}>What you can do now:</Text>

          <Section style={features}>
            <Text style={feature}>
              ✓ Create your player profile with transparent ratings
            </Text>
            <Text style={feature}>
              ✓ Log matches and see real-time rating updates
            </Text>
            <Text style={feature}>
              ✓ Connect with other players in your area
            </Text>
            <Text style={feature}>
              ✓ View open-source algorithms behind every rating
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://opencourtpb.com" style={ctaButton}>
              Start Playing on OpenCourt
            </Link>
          </Section>

          <Text style={text}>
            As a waitlist member, you're getting early access to all features.
            No ads, no hidden algorithms, no corporate interference - just
            honest pickleball ratings built by players, for players.
          </Text>

          <Text style={text}>
            Ready to experience transparent pickleball ratings? Let's build the
            future of the sport together.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Welcome to the community,
            <br />
            The OpenCourt Team
          </Text>

          <Text style={footerNote}>
            You're receiving this email because you signed up for the OpenCourt
            waitlist with {email}. This is our launch announcement - the moment
            you've been waiting for!
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#111113',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#111113',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '40px 20px 20px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderBottom: 'none',
  borderRadius: '12px 12px 0 0',
};

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '-0.02em',
  lineHeight: '1.2',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const tagline = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '40px 20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: 'none',
  borderRadius: '0 0 12px 12px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const features = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const feature = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
  paddingLeft: '8px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#ffffff',
  color: '#111113',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  border: '2px solid #ffffff',
};

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const footerNote = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};

export default WaitlistLaunchEmail;
