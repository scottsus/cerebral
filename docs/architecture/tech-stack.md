# Tech Stack

Indorder is built with modern, production-ready technologies chosen for performance, developer experience, and scalability.

## Frontend Technologies

### Core Framework

#### Next.js 14
- **Version**: 14.2.23
- **Why**: Full-stack React framework with server-side rendering, API routes, and excellent DX
- **Features Used**:
  - App Router (new routing system)
  - Server Components
  - Server Actions
  - Streaming and Suspense
  - Built-in optimization (images, fonts, scripts)

```json
"next": "^14.2.23"
```

#### React 18
- **Version**: 18.3.1
- **Why**: Industry-standard UI library with hooks, concurrent features
- **Features Used**:
  - Functional components
  - Hooks (useState, useEffect, useMemo, useCallback)
  - Context API
  - Suspense boundaries

```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```

#### TypeScript
- **Version**: 5.5.4
- **Why**: Type safety, better IDE support, catch errors at compile time
- **Configuration**: `tsconfig.json`

```json
"typescript": "^5.5.4"
```

### Styling

#### Tailwind CSS
- **Version**: 3.4.1
- **Why**: Utility-first CSS framework for rapid UI development
- **Plugins**:
  - `tailwindcss-animate` - Animation utilities
- **Configuration**: `tailwind.config.ts`

```json
"tailwindcss": "^3.4.1",
"tailwindcss-animate": "^1.0.7"
```

#### PostCSS
- **Version**: 8.4.38
- **Why**: CSS preprocessor for Tailwind
- **Configuration**: `postcss.config.cjs`

```json
"postcss": "^8.4.38"
```

### UI Components

#### Shadcn UI
- **Based on**: Radix UI primitives
- **Why**: Accessible, customizable component library
- **Components Used**:
  - Button
  - Card
  - Dialog
  - Table
  - Tabs
  - Badge
- **Configuration**: `components.json`

```json
"@radix-ui/react-dialog": "^1.0.5",
"@radix-ui/react-slot": "^1.0.2",
"@radix-ui/react-tabs": "^1.0.4"
```

#### Utility Libraries
```json
"clsx": "^2.1.1",                    // Conditional className composition
"tailwind-merge": "^2.3.0",         // Merge Tailwind classes
"class-variance-authority": "^0.7.0" // Component variants
```

### Icons & Fonts

#### Lucide React
- **Version**: 0.424.0
- **Why**: Beautiful, consistent icon library
- **Usage**: Over 1000+ icons

```json
"lucide-react": "^0.424.0"
```

#### Google Fonts
- **Outfit**: Primary font family
- **Geist**: Monospace font
- **Loading**: next/font optimized loading

```typescript
import { Outfit } from "next/font/google";
const outfit = Outfit({ subsets: ["latin"] });
```

### Data Visualization

#### Chart.js
- **Version**: 4.4.3
- **Why**: Flexible charting library
- **Charts Used**: Pie chart for order completion

```json
"chart.js": "^4.4.3",
"react-chartjs-2": "^5.2.0"
```

### UI Utilities

#### Sonner
- **Version**: 1.5.0
- **Why**: Beautiful toast notifications
- **Usage**: Success, error, info messages

```json
"sonner": "^1.5.0"
```

#### React Loader Spinner
- **Version**: 6.1.6
- **Why**: Loading indicators
- **Usage**: QR code loading state

```json
"react-loader-spinner": "^6.1.6"
```

## Backend Technologies

### Framework

#### Next.js Server Actions
- **Why**: Type-safe API endpoints without separate backend
- **Benefits**:
  - Co-located with frontend
  - Automatic serialization
  - Progressive enhancement
  - Type safety end-to-end

```typescript
"use server";

export async function createUser(data: UserData) {
  // Server-side code
  return await db.insert(users).values(data);
}
```

### Database

#### PostgreSQL
- **Why**: Robust, ACID-compliant relational database
- **Deployment Options**:
  - Local: Docker container
  - Cloud: Supabase, Neon, AWS RDS, Railway

```bash
# Docker setup
./start-database.sh
```

#### Drizzle ORM
- **Version**: 0.36.4
- **Why**: TypeScript-first ORM with excellent DX
- **Features**:
  - Type-safe queries
  - Migration management
  - Query builder
  - Drizzle Studio (GUI)

```json
"drizzle-orm": "^0.36.4",
"drizzle-kit": "^0.29.1"
```

#### postgres.js
- **Version**: 3.4.5
- **Why**: Fast, modern PostgreSQL client
- **Features**: Connection pooling, TypeScript support

```json
"postgres": "^3.4.5"
```

### Authentication

#### Clerk
- **Version**: 6.9.3
- **Why**: Complete auth solution with minimal setup
- **Features**:
  - Sign up/sign in
  - Session management
  - User management
  - Protected routes
  - Webhooks

```json
"@clerk/nextjs": "^6.9.3"
```

### AI Integration

#### Vercel AI SDK
- **Version**: 4.0.21
- **Why**: Simplifies AI integration with streaming support
- **Features**: OpenAI integration, streaming responses

```json
"ai": "^4.0.21"
```

#### OpenAI
- **Version**: 4.76.1
- **Why**: State-of-the-art language model for order parsing
- **Usage**: Parse WhatsApp messages into structured data

```json
"openai": "^4.76.1"
```

## Development Tools

### Environment Management

#### @t3-oss/env-nextjs
- **Version**: 0.11.1
- **Why**: Type-safe environment variables with Zod validation
- **Configuration**: `src/env.js`

```json
"@t3-oss/env-nextjs": "^0.11.1"
```

#### Zod
- **Version**: 3.23.8
- **Why**: Runtime type validation
- **Usage**: Environment variables, form validation

```json
"zod": "^3.23.8"
```

### Code Quality

#### ESLint
- **Version**: 9.17.0
- **Why**: Code linting and style enforcement
- **Configuration**: `.eslintrc.cjs`

```json
"eslint": "^9.17.0",
"@typescript-eslint/eslint-plugin": "^8.18.1",
"@typescript-eslint/parser": "^8.18.1"
```

#### Prettier
- **Version**: 3.4.2
- **Why**: Consistent code formatting
- **Plugins**:
  - Tailwind CSS class sorting
  - Import sorting
- **Configuration**: `prettier.config.mjs`

```json
"prettier": "^3.4.2",
"prettier-plugin-tailwindcss": "^0.6.9",
"@ianvs/prettier-plugin-sort-imports": "^4.4.0"
```

### Build Tools

#### Turbopack
- **Included in**: Next.js 14
- **Why**: Faster builds than Webpack
- **Usage**: `next dev --turbo`

## Infrastructure

### Containerization

#### Docker
- **Usage**: Local PostgreSQL database
- **Configuration**: `start-database.sh`

```bash
#!/usr/bin/env bash
# Start PostgreSQL in Docker
docker run -d \
  --name indorder-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=indorder \
  -p 5432:5432 \
  postgres:16
```

### Version Control

#### Git
- **Configuration**: `.gitignore`
- **Branch Strategy**: Feature branches → main

## Package Manager

### npm / Yarn
- **Primary**: npm (based on `package-lock.json`)
- **Alternative**: Yarn (based on `yarn.lock`)
- **Version**: Node 18+

```bash
npm install
# or
yarn install
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# WhatsApp Backend
NEXT_PUBLIC_BACKEND_URL=https://backend.example.com

# OpenAI
OPENAI_API_KEY=sk-...

# Node Environment
NODE_ENV=development
```

## Production Deployment

### Recommended Platforms

#### Vercel (Recommended)
- **Why**: Built by Next.js creators, zero-config deployment
- **Features**:
  - Automatic HTTPS
  - Edge network
  - Preview deployments
  - Environment variables

```bash
npm run build
vercel deploy
```

#### Alternative Platforms
- **Railway**: Full-stack hosting with database
- **Netlify**: Serverless deployment
- **AWS**: Amplify or EC2 with RDS
- **Docker**: Self-hosted deployment

## Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Dependencies Summary

### Production Dependencies (23 packages)
- **Framework**: Next.js, React
- **UI**: Radix UI, Lucide Icons, Chart.js
- **Database**: Drizzle ORM, postgres.js
- **Auth**: Clerk
- **AI**: OpenAI, Vercel AI SDK
- **Utilities**: Zod, clsx, date-fns

### Development Dependencies (13 packages)
- **TypeScript**: Compiler and types
- **Linting**: ESLint, TypeScript ESLint
- **Formatting**: Prettier with plugins
- **Database**: Drizzle Kit
- **Build Tools**: Tailwind CSS, PostCSS

## Technology Decisions Rationale

### Why Server Actions over REST API?
- **Type Safety**: Shared types between client and server
- **Simplicity**: No need for separate API layer
- **Performance**: Reduced network overhead
- **DX**: Co-located with components

### Why Drizzle over Prisma?
- **Performance**: Lighter weight, faster queries
- **Type Safety**: Better TypeScript integration
- **Flexibility**: More control over SQL
- **Learning Curve**: Easier for developers familiar with SQL

### Why Clerk over NextAuth?
- **Speed**: Faster setup and integration
- **Features**: Built-in UI components
- **Maintenance**: Managed service, less code to maintain
- **Scalability**: Handles auth at scale

### Why Tailwind over CSS Modules?
- **Productivity**: Faster development
- **Consistency**: Design system built-in
- **Performance**: Purges unused CSS
- **Maintainability**: Utility classes reduce CSS bloat

## Version Compatibility

### Node.js
- **Minimum**: 18.17.0
- **Recommended**: 20.x LTS

### Browsers (Production)
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS 12+, Android 5+

## Related Documentation

- [System Overview](./overview.md) - Architecture overview
- [Database Schema](./database-schema.md) - Database structure
- [Installation](../getting-started/installation.md) - Setup guide
- [Deployment](../deployment/production.md) - Production deployment

---

This tech stack provides a modern, scalable foundation optimized for developer productivity and user experience.
