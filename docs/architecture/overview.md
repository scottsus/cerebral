# Architecture Overview

Indorder is built as a modern full-stack application using Next.js 14 with Server Actions, providing a seamless integration between frontend and backend.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Landing   │  │   Dashboard  │  │   WhatsApp       │    │
│  │   Page     │  │   Interface  │  │   Connection     │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Server Actions
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Server Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    User      │  │   Receipt    │  │    WhatsApp      │  │
│  │   Actions    │  │   Actions    │  │    Actions       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│                   ┌─────────────────┐                       │
│                   │  Drizzle ORM    │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│                    ┌──────────────┐                          │
│                    │  PostgreSQL  │                          │
│                    │  ┌────────┐  │                          │
│                    │  │ Users  │  │                          │
│                    │  └────────┘  │                          │
│                    │  ┌────────┐  │                          │
│                    │  │Receipts│  │                          │
│                    │  └────────┘  │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘

External Services:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Clerk     │  │   OpenAI    │  │  WhatsApp   │
│    Auth     │  │     API     │  │   Backend   │
└─────────────┘  └─────────────┘  └─────────────┘
```

## System Components

### 1. Client Layer (Frontend)

The client layer is built with **React 18** and **Next.js 14**, utilizing the App Router for modern routing and server components.

#### Key Pages:
- **Landing Page** (`src/app/page.tsx`): Entry point with authentication
- **Setup Page** (`src/app/setup/page.tsx`): Initial business configuration
- **Connection Page** (`src/app/connect/[userId]/page.tsx`): WhatsApp QR code integration
- **Dashboard** (`src/app/(protected)/dashboard/page.tsx`): Main application interface

#### Protected Routes:
All routes within `(protected)` directory require authentication via Clerk middleware.

### 2. Server Layer (Backend)

The server layer uses **Next.js Server Actions** for backend logic, eliminating the need for a separate API layer.

#### Server Actions:
- **User Actions** (`src/actions/user.ts`): User CRUD operations
- **Receipt Actions** (`src/actions/receipts.ts`): Order data management
- **WhatsApp Actions** (`src/actions/whatsapp.ts`): Device connection handling

### 3. Database Layer

**PostgreSQL** database managed through **Drizzle ORM** provides:
- Type-safe database queries
- Schema migrations
- Relationship management

#### Tables:
- `users`: Business and user information
- `receipts`: Order records with status tracking

See [Database Schema](./database-schema.md) for detailed structure.

### 4. External Services

#### Clerk Authentication
- User registration and login
- Session management
- Protected route middleware
- User profile management

#### OpenAI Integration
- Natural language processing
- Order information extraction
- Context-aware message parsing

#### WhatsApp Backend Service
- QR code generation
- Device pairing
- Message webhook handling
- Connection status management

## Data Flow

### Order Processing Flow

```
1. Customer sends WhatsApp message
        ↓
2. WhatsApp Backend receives message
        ↓
3. AI (OpenAI) processes message
        ↓
4. Order data extracted and structured
        ↓
5. Receipt created in database
        ↓
6. Dashboard updates in real-time
        ↓
7. Business owner views order details
```

### User Onboarding Flow

```
1. User visits landing page
        ↓
2. Sign up via Clerk
        ↓
3. Complete setup form
        ↓
4. Data saved to users table
        ↓
5. Redirect to WhatsApp connection
        ↓
6. Scan QR code
        ↓
7. Listener status: INITIALIZING → RUNNING
        ↓
8. Redirect to dashboard
```

## Architecture Patterns

### Server-First Architecture

Indorder leverages Next.js 14's server-first approach:
- **Server Components**: Default rendering mode for optimal performance
- **Server Actions**: Backend logic co-located with frontend code
- **Streaming**: Progressive rendering for faster initial page loads

### Database Access Pattern

```typescript
// Direct database access from Server Actions
export async function getUserByEmail(email: string) {
  "use server";
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}
```

### Authentication Pattern

```typescript
// Clerk middleware protects routes
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Component Composition

```
Page (Server Component)
  └─ Dashboard Client (Client Component)
      ├─ Orders (Client Component)
      │   └─ OrderInfo (Client Component)
      └─ Analytics (Client Component)
```

## Performance Considerations

### Optimizations
1. **Server Components**: Reduce JavaScript bundle size
2. **Code Splitting**: Automatic route-based splitting
3. **Image Optimization**: Next.js built-in image optimization
4. **Database Indexing**: Optimized queries with Drizzle ORM
5. **Caching**: Server-side caching for static content

### Scalability
- **Horizontal Scaling**: Stateless server actions enable easy scaling
- **Database Connection Pooling**: Efficient database connections
- **CDN Integration**: Static assets served via CDN
- **Edge Runtime**: Deploy to edge for reduced latency

## Security Architecture

### Authentication & Authorization
- **Clerk Integration**: Enterprise-grade authentication
- **Session Management**: Secure, httpOnly cookies
- **Route Protection**: Middleware-based access control

### Data Security
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Environment Variables**: Secrets managed via `.env` files
- **HTTPS**: Enforced in production
- **CORS**: Configured for API endpoints

### Input Validation
- **Zod Schemas**: Runtime type validation
- **Server-Side Validation**: All inputs validated on server
- **Sanitization**: User inputs sanitized before storage

## Deployment Architecture

### Recommended Deployment

```
┌─────────────────────────────────────────┐
│         Vercel (Next.js App)            │
│  ┌─────────────────────────────────┐   │
│  │   Next.js Server Actions        │   │
│  │   (Serverless Functions)        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              ├──────────────┬──────────────┬──────────────┐
              ▼              ▼              ▼              ▼
┌──────────────────┐  ┌────────────┐  ┌─────────┐  ┌──────────┐
│   PostgreSQL     │  │   Clerk    │  │ OpenAI  │  │ WhatsApp │
│   (Supabase/     │  │   Auth     │  │   API   │  │ Backend  │
│    Neon/RDS)     │  │            │  │         │  │          │
└──────────────────┘  └────────────┘  └─────────┘  └──────────┘
```

See [Production Deployment](../deployment/production.md) for detailed deployment instructions.

## Technology Decisions

### Why Next.js 14?
- **Server Actions**: Simplified backend logic without separate API
- **App Router**: Modern routing with improved performance
- **Built-in Optimization**: Image, font, and script optimization
- **Developer Experience**: Fast refresh, TypeScript support

### Why Drizzle ORM?
- **Type Safety**: Full TypeScript support
- **Performance**: Minimal overhead
- **Developer Experience**: Intuitive query builder
- **Migration Management**: Version-controlled schema changes

### Why Clerk?
- **Rapid Integration**: Quick setup with pre-built components
- **Security**: Enterprise-grade authentication
- **User Management**: Built-in user dashboard
- **Scalability**: Handles authentication at scale

### Why PostgreSQL?
- **Reliability**: ACID compliance
- **Scalability**: Handles complex queries efficiently
- **JSON Support**: Flexible data storage
- **Ecosystem**: Rich tooling and community support

## Related Documentation

- [Tech Stack](./tech-stack.md) - Detailed technology breakdown
- [Database Schema](./database-schema.md) - Database structure
- [Directory Structure](./directory-structure.md) - Project organization
- [Server Actions](../development/server-actions.md) - Backend API details

---

This architecture provides a solid foundation for building a scalable, maintainable, and performant order management system.
