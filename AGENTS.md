# AGENTS.md - OpenCourt Development Guide

## Build/Lint/Test Commands

- `bun run dev` - Start development server (Next.js + Convex)
- `bun run build` - Build for production
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Auto-fix linting issues
- `bun run type-check` - TypeScript type checking
- `bun run email:preview` - Preview email templates

## Code Style Guidelines

- **Formatter**: Biome with 2-space indentation, 80 char line width, single quotes
- **Imports**: Use `@/` path alias for project root imports
- **Types**: Use TypeScript with strict mode, prefer `type` over `interface`
- **Components**: Use React.forwardRef for UI components, export named functions
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Use try/catch blocks, console.error for debugging (with biome-ignore)
- **State**: Use descriptive state enums/constants (e.g., `STATES.idle`)
- **Styling**: Tailwind CSS with clsx for conditional classes, use cn() utility

## Tech Stack

- Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- Convex for backend, Radix UI components, React Hook Form + Zod validation
- Biome for linting/formatting, Bun as package manager
