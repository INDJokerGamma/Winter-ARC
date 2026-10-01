# Winter Arc

Winter Arc is a personal challenge and habit-tracking web app for building consistent routines over a defined period. It brings together goal tracking, daily progress logging, reflections, analytics, achievements, and calendar history in a single app.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Supabase Auth](#supabase-auth)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Security Notes](#security-notes)

## Overview

Winter Arc helps users:

- define and manage personal goals
- track daily completion and momentum
- reflect on productivity, energy, and mindset
- review progress over time with calendar and analytics views
- maintain motivation through streaks and achievements

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS
- Supabase Auth + Postgres
- React Router
- Recharts + date-fns

## Features

- Create, edit, complete, archive, and delete goals
- Organize goals by category and priority
- Log daily goal completion
- Save productivity, energy, and written reflections
- Review activity in a calendar
- View analytics, streaks, and progress over time
- Track achievements and milestones
- Manage profile name and theme preferences

## Prerequisites

Before you begin, make sure you have:

- Node.js 20.19+ or a current LTS release
- npm
- A Supabase project

## Local Setup

1. Clone the repository and move into the project directory:

   ```bash
   git clone https://github.com/INDJokerGamma/Winter-ARC.git
   cd Winter-ARC
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   On macOS/Linux:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Configure your environment variables in `.env`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

   Use the publishable key for this browser app. Do not place a Supabase secret or `service_role` key in any `VITE_*` variable.

5. Set up the database in Supabase:

   Open the Supabase Dashboard and use the SQL Editor to run these migration files in order:

   1. `supabase/migrations/00001_initial_schema.sql`
   2. `supabase/migrations/00002_daily_reflections.sql`
   3. `supabase/migrations/00003_goal_display_order.sql`
   4. `supabase/migrations/00004_harden_auth_trigger.sql`

   These migrations create the tables, profile trigger, reflection constraint, and Row Level Security policies used by the app.

6. Start the development server:

   ```bash
   npm run dev
   ```

   Open the URL printed by Vite, usually `http://localhost:5173`.

## Environment Variables

The app expects the following variables in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

These values are required for frontend authentication and database access through Supabase.

## Database Setup

Use the Supabase SQL Editor to run the app migrations in the order shown below:

```sql
-- 1. supabase/migrations/00001_initial_schema.sql
-- 2. supabase/migrations/00002_daily_reflections.sql
-- 3. supabase/migrations/00003_goal_display_order.sql
-- 4. supabase/migrations/00004_harden_auth_trigger.sql
```

This sets up the schema and security policies needed for user profiles, goals, reflections, and related data.

## Supabase Auth

Create an account from the Register page. If email confirmation is enabled in Supabase, confirm the email sent to the registered address before signing in.

For local testing, email confirmation can be managed in:

- Supabase Dashboard
- Authentication
- Providers
- Email

Keep confirmation enabled for production apps.

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build locally
```

## Deployment

Build the application:

```bash
npm run build
```

Deploy the generated `dist/` directory to a static hosting provider such as Vercel, Netlify, or Cloudflare Pages.

Add the same two environment variables from `.env` to your hosting provider, then configure the deployed URL in the Supabase Auth redirect/site URL settings if email confirmation or password recovery is enabled.

## Security Notes

- `.env` is ignored and should never be committed.
- `.env.example` contains placeholders only and is safe to commit.
- The browser uses a Supabase publishable key; database access is enforced by Row Level Security.
- Never expose a Supabase secret or legacy `service_role` key in browser code.

