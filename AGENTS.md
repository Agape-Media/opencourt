# Agent Guidelines for OpenCourt

## Build/Lint/Test Commands

- **Dev**: `bun run dev` (runs Convex + Next.js with Turbo)
- **Build**: `bun run build`
- **Lint**: `bun run lint` (Biome check)
- **Lint Fix**: `bun run lint:fix` (Biome check with --write)
- **Email Preview**: `bun run email:preview`
- No test framework configured

## Code Style (Biome Configuration)

- **Formatting**: 2 spaces, 80 char line width, double quotes, trailing commas (ES5)
- **Imports**: Auto-organize imports, use `@/` for root imports
- **TypeScript**: Strict mode enabled, preserve JSX
- **Components**: Use React.forwardRef for UI components, export interfaces
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Return objects with `{ success: boolean; error?: string }`
- **Server Actions**: Use "use server" directive, handle errors gracefully

## Tech Stack

- Next.js 15 with App Router, Convex backend, Tailwind CSS, Radix UI, TypeScript, React Email
