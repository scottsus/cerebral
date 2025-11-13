# Quick Start Guide

Get Indorder up and running in just a few minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (for local PostgreSQL database)
- **Git**

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd indorder
```

## Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

## Step 3: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the required variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/indorder

# Backend Service
BACKEND_URL=your_backend_url

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

> **Note**: For detailed environment configuration, see [Environment Configuration](./environment.md).

## Step 4: Start the Database

Run the provided script to start a PostgreSQL database in Docker:

```bash
./start-database.sh
```

This will:
- Create a Docker container running PostgreSQL
- Set up the database with default credentials
- Expose the database on port 5432

## Step 5: Push Database Schema

Initialize the database with the required schema:

```bash
npm run db:push
```

This command uses Drizzle ORM to create all necessary tables and relationships.

## Step 6: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Step 7: Create Your First User

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click **Sign Up** to create a new account
3. Complete the Clerk authentication flow
4. Fill out the **Setup Form** with your business information:
   - Business Name
   - Your Name
   - Email
   - Phone Number
   - Business Description
   - Welcome Message

## Step 8: Connect WhatsApp

1. After setup, you'll be redirected to the **WhatsApp Connection** page
2. Scan the QR code with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to **Settings** → **Linked Devices**
   - Tap **Link a Device**
   - Scan the QR code displayed
3. Wait for the connection status to show **"RUNNING"**
4. Click **Go to Dashboard**

## Step 9: View Your Dashboard

You're now ready to start receiving and managing orders!

The dashboard provides:
- **Orders Tab**: View all incoming orders
- **Analytics Tab**: See business metrics and completion rates

## What's Next?

- Learn about [WhatsApp Integration](../features/whatsapp-integration.md)
- Explore the [Dashboard Features](../features/dashboard.md)
- Understand [AI Order Processing](../features/ai-processing.md)
- Review the [Architecture Overview](../architecture/overview.md)

## Common Issues

### Database Connection Failed

If you see database connection errors:
1. Ensure Docker is running
2. Verify the `start-database.sh` script executed successfully
3. Check that `DATABASE_URL` in `.env` matches your Docker configuration

### Clerk Authentication Not Working

1. Verify your Clerk API keys are correct
2. Ensure your domain is configured in the Clerk dashboard
3. Check that middleware is properly configured in `src/middleware.ts`

### WhatsApp QR Code Not Appearing

1. Verify `BACKEND_URL` is correctly set in `.env`
2. Ensure the backend service is running and accessible
3. Check browser console for network errors

For more troubleshooting help, see the [Troubleshooting Guide](../support/troubleshooting.md).

## Development Commands

Here are some useful commands for development:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push       # Push schema changes
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio

# Code quality
npm run lint          # Run ESLint
npm run format        # Format with Prettier
```

---

**Congratulations!** You now have Indorder running locally. Continue to the [Installation Guide](./installation.md) for more detailed setup instructions.
