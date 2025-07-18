# OpenCourt - Waitlist Template

A modern, responsive waitlist application built with Next.js, featuring email collection via Resend and a clean, professional design.

## Features

- 🔸 Modern, responsive design with dark/light mode support
- 🔸 Email collection and validation using Resend
- 🔸 Static content management (no CMS required)
- 🔸 Fully customizable design and content
- 🔸 Built with Next.js 15 and TypeScript
- 🔸 Optimized images with Next.js Image component

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Resend (for email handling)
- Radix UI components

## Quick Start

**Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

**Environment Setup**

Create a `.env.local` file:

```env
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Get your Resend API key from [resend.com](https://resend.com/)

**Start the development server**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Customization

### Content Configuration

Edit `lib/content.ts` to customize:
- Site metadata (title, description, OG images)
- Waitlist form text and messages
- Navigation items
- Manifesto content

### Styling

The application uses Tailwind CSS. Customize the design by editing:
- `app/globals.css` for global styles
- Component files for specific styling
- `tailwind.config.js` for theme configuration

### Logo

Replace the logo files in the `public` directory:
- `logo-dark.svg` - Logo for dark mode
- `logo-light.svg` - Logo for light mode

### Email Configuration

Update the email templates and sender information in:
- `app/api/waitlist/route.ts`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

- `RESEND_API_KEY` - Your Resend API key for sending emails
- `NEXT_PUBLIC_BASE_URL` - Your application's base URL (for API calls)

## License

MIT License - feel free to use this template for your projects.
# opencourt
