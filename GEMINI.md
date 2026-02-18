# GEMINI.md

## Project Overview

This is a production-ready Learning Management System (LMS) for the Tanium Certified Operator (TCO) certification exam. It is a comprehensive platform that provides interactive learning modules, practice assessments, and a full exam simulator.

The project is built on a modern, enterprise-grade technology stack:

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5.9.2 with strict mode
- **UI**: shadcn/ui + Radix UI for accessible, professional components
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL with real-time features and RLS security
- **Content**: MDX for interactive learning modules
- **Analytics**: PostHog for user behavior tracking
- **AI**: Anthropic AI SDK (Claude) for intelligent content features

## Building and Running

### Prerequisites

- Node.js 18+
- npm
- git

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    ```bash
    cp .env.example .env.local
    ```
    You will need to add your Supabase credentials to the `.env.local` file.

### Development

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building

To create a production build:

```bash
npm run build
```

### Testing

To run the test suite:

```bash
npm run test
```

## Development Conventions

- **Linting**: ESLint is used for code quality. Run `npm run lint` to check for issues.
- **Formatting**: Prettier is used for code formatting. Run `npm run format` to format the code.
- **Git Hooks**: Husky is used to run pre-commit and pre-push hooks to ensure code quality.
- **Commits**: Conventional Commits are not explicitly mentioned, but the detailed `README.md` suggests a structured approach to development.
- **Branching**: No specific branching strategy is mentioned, but the project is hosted on Git.
