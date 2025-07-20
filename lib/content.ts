export const siteConfig = {
  metadata: {
    titleTemplate: '%s | OpenCourt',
    defaultTitle: 'OpenCourt - Transparent Pickleball for the People',
    defaultDescription:
      'The open-source, ad-free alternative to DUPR. Built by the community, for the community. Transparent ratings, no ads, and truly for the people.',
    favicon: {
      url: '/favicon.ico',
    },
    ogImage: {
      url: '/og-image.png',
    },
  },
  settings: {
    logo: {
      url: '/logo.png',
      alt: 'OpenCourt Logo',
    },
    navigation: [
      { label: 'Home', url: '/' },
      { label: 'Manifesto', url: '/manifesto' },
    ],
  },
};

export const waitlistConfig = {
  title: 'Pickleball Ratings, Reimagined',
  subtitle:
    'The transparent, community-driven alternative to DUPR. Open source, ad-free, and built for players by players. Join the movement for honest pickleball ratings.',
  form: {
    emailPlaceholder: 'Enter your email address',
    submitText: 'Join the Movement',
    successMessage: "Welcome to the community! We'll be in touch soon.",
    errorMessage: 'Something went wrong. Please try again.',
  },
};

export const manifestoConfig = {
  title: 'Our Manifesto',
  content: `
    <h2>Pickleball Deserves Better</h2>
    <p>Corporate rating systems prioritize profit over players. Hidden algorithms, endless ads, and zero transparency. We're done with that.</p>
    
    <p><strong>OpenCourt is the revolution.</strong> Open source. Zero ads. Transparent ratings. Built by players, for players.</p>
    
    <h3>Our Promise</h3>
    <ul>
      <li><strong>Transparent:</strong> Open algorithms, no black boxes</li>
      <li><strong>Community-Driven:</strong> Your feedback shapes the algorithm</li>
      <li><strong>Ad-Free Forever:</strong> Pure pickleball, zero distractions</li>
    </ul>
    
    <p>Join the movement. Take back pickleball ratings.</p>
  `,
};
