# Indorder Documentation

Welcome to the comprehensive documentation for **Indorder** - a WhatsApp-based AI-powered order management system for small businesses.

## What is Indorder?

Indorder is a full-stack application that enables small businesses to receive and manage customer orders through WhatsApp, powered by AI to automatically parse and organize order information. The platform provides a modern web dashboard for order tracking, analytics, and business insights.

**Tagline**: "Where orders meets AI"

## Documentation Structure

This documentation is organized into several sections to help you understand, set up, and work with Indorder:

### Getting Started
- [Quick Start Guide](./getting-started/quick-start.md) - Get up and running in minutes
- [Installation](./getting-started/installation.md) - Detailed setup instructions
- [Environment Configuration](./getting-started/environment.md) - Configure your environment variables
- [Database Setup](./getting-started/database.md) - Set up PostgreSQL and run migrations

### Architecture
- [System Overview](./architecture/overview.md) - High-level architecture and data flow
- [Tech Stack](./architecture/tech-stack.md) - Technologies and libraries used
- [Database Schema](./architecture/database-schema.md) - Database structure and relationships
- [Directory Structure](./architecture/directory-structure.md) - Project organization

### Features
- [Authentication](./features/authentication.md) - User authentication with Clerk
- [WhatsApp Integration](./features/whatsapp-integration.md) - How WhatsApp connectivity works
- [AI Order Processing](./features/ai-processing.md) - AI-powered message parsing
- [Dashboard](./features/dashboard.md) - Order management interface
- [Analytics](./features/analytics.md) - Business metrics and insights

### Development
- [Development Workflow](./development/workflow.md) - Day-to-day development practices
- [Server Actions](./development/server-actions.md) - Backend API endpoints
- [Components](./development/components.md) - React component architecture
- [Styling Guide](./development/styling.md) - Tailwind CSS and UI components
- [Testing](./development/testing.md) - Testing strategies and practices

### API Reference
- [User Actions](./api/user-actions.md) - User management endpoints
- [Receipt Actions](./api/receipt-actions.md) - Order data operations
- [WhatsApp Actions](./api/whatsapp-actions.md) - WhatsApp integration endpoints

### Deployment
- [Production Deployment](./deployment/production.md) - Deploy to production
- [Environment Variables](./deployment/environment-variables.md) - Production configuration
- [Database Management](./deployment/database-management.md) - Production database operations

### Contributing
- [Contributing Guide](./contributing/guide.md) - How to contribute to Indorder
- [Code Style](./contributing/code-style.md) - Coding standards and conventions
- [Pull Request Process](./contributing/pr-process.md) - How to submit changes

## Quick Links

- **GitHub Repository**: [View on GitHub](#)
- **Live Demo**: [Try Indorder](#)
- **Report Issues**: [Issue Tracker](#)

## Core Technologies

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **AI**: OpenAI with Vercel AI SDK
- **UI Components**: Shadcn UI

## Key Features

✨ **WhatsApp Integration** - Connect your WhatsApp account via QR code
🤖 **AI-Powered** - Automatic order parsing from customer messages
📊 **Analytics Dashboard** - Real-time business metrics and insights
🔒 **Secure Authentication** - Enterprise-grade auth with Clerk
🎨 **Modern UI** - Beautiful, responsive interface with Shadcn UI
⚡ **Blazingly Fast** - Built on Next.js 14 with Server Actions

## Support

Need help? Here are some resources:

- Check the [FAQ](./support/faq.md)
- Read the [Troubleshooting Guide](./support/troubleshooting.md)
- Join our [Community](#)
- Contact [Support](#)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to get started?** Head over to the [Quick Start Guide](./getting-started/quick-start.md)!
