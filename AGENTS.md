# AGENTS.md - OpenCourt Development Guide

## Build/Lint/Test Commands

- `bun run dev` - Start development server (Next.js + Convex)
- `bun run build` - Build for production
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format:fix` - Format code with Biome
- `bun run check:fix` - Run all Biome checks and fixes
- No test framework configured - verify changes manually

## Code Style Guidelines

- **Formatter**: Biome with 2-space indentation, 80 char line width
- **Imports**: Use `@/` for absolute imports, organize imports automatically
- **Types**: Use TypeScript with strict mode, prefer `type` over `interface`
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Use function declarations, destructure props with types
- **Error Handling**: Use try/catch with proper error logging, return structured responses
- **Quotes**: Double quotes for JSX, semicolons as needed, trailing commas ES5 style

## Tech Stack

- Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- Convex for backend, Resend for emails, Radix UI components, Zod validation
