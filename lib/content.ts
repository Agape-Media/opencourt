export const siteConfig = {
  metadata: {
    titleTemplate: "%s | OpenCourt",
    defaultTitle: "OpenCourt - Transparent Pickleball for the People",
    defaultDescription:
      "The open-source, ad-free alternative to DUPR. Built by the community, for the community. Transparent ratings, no ads, and truly for the people.",
    favicon: {
      url: "/favicon.ico",
    },
    ogImage: {
      url: "/og-image.png",
    },
  },
  settings: {
    logo: {
      url: "/logo.png",
      alt: "OpenCourt Logo",
    },
    navigation: [
      { label: "Home", url: "/" },
      { label: "Manifesto", url: "/manifesto" },
    ],
  },
};

export const waitlistConfig = {
  title: "Pickleball Ratings, Reimagined",
  subtitle:
    "The transparent, community-driven alternative to DUPR. Open source, ad-free, and built for players by players. Join the movement for honest pickleball ratings.",
  form: {
    emailPlaceholder: "Enter your email address",
    submitText: "Join the Movement",
    successMessage: "Welcome to the community! We'll be in touch soon.",
    errorMessage: "Something went wrong. Please try again.",
  },
};

export const manifestoConfig = {
  title: "Our Manifesto",
  content: `
    <h2>For the Players, By the Players</h2>
    <p>Pickleball deserves better than corporate-controlled rating systems filled with ads and hidden algorithms. OpenCourt is the transparent, community-driven alternative to DUPR that puts players first.</p>
    
    <h3>Why We Exist</h3>
    <p>DUPR has become a walled garden that prioritizes profit over players. We believe pickleball ratings should be open, honest, and serve the community—not shareholders. That's why we're building OpenCourt as a true alternative.</p>
    
    <h3>Our Principles</h3>
    <ul>
      <li><strong>Transparency:</strong> Open algorithms, clear rating calculations, no black boxes</li>
      <li><strong>Community-Driven:</strong> Built with player feedback, governed by the community</li>
      <li><strong>Open Source:</strong> Code is public, auditable, and improvable by anyone</li>
      <li><strong>Zero Ads:</strong> No distractions, no data harvesting, just pure pickleball</li>
      <li><strong>For the People:</strong> Non-profit mindset focused on serving players, not profit</li>
    </ul>
    
    <h3>The OpenCourt Difference</h3>
    <p>We listen to the community because we ARE the community. Every feature, every decision, every line of code is guided by what's best for pickleball players. No corporate overlords, no hidden agendas—just honest ratings for honest players.</p>
    
    <h3>Join the Movement</h3>
    <p>Help us build the rating system pickleball deserves. Together, we can create something truly for the people, by the people.</p>
  `,
};
