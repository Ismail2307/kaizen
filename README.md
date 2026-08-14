# Kaizen — Gamified Personal Growth Platform

A full-stack, gamified productivity and personal growth application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **shadcn/ui**.

> **Create Goal → Break It Down → Take Action → Earn XP → Improve → Compete**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Supabase Setup (Detailed)](#supabase-setup-detailed)
4. [Environment Variables](#environment-variables)
5. [Running the App](#running-the-app)
6. [Feature Overview](#feature-overview)
7. [Database Schema](#database-schema)
8. [Troubleshooting](#troubleshooting)
9. [Tech Stack](#tech-stack)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** and **npm** installed
  ```bash
  node -v   # Should be v18.17.0 or higher
  npm -v    # Should be 9.0.0 or higher
  ```
- A **Supabase** account (free tier is sufficient)
  - Sign up at [https://supabase.com](https://supabase.com)
- A code editor (VS Code recommended)

---

## Quick Start

If you already know Supabase, here is the 60-second version:

```bash
# 1. Unzip the project
cd kaizen

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Fill in your Supabase credentials in .env.local

# 5. Run the database migrations in Supabase SQL Editor
#    - Open supabase/migrations/001_initial_schema.sql
#    - Open supabase/migrations/002_seed_data.sql
#    - Run both in Supabase → SQL Editor

# 6. Start the dev server
npm run dev
```

**Then open [http://localhost:3000](http://localhost:3000)**

---

## Supabase Setup (Detailed)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Name it `kaizen`
4. Choose a region closest to your users
5. Set a secure database password (save it somewhere safe)
6. Click **"Create new project"**
7. Wait ~2 minutes for the project to provision

### Step 2: Get Your API Keys

1. In your Supabase dashboard, click the **Settings** icon (gear) in the left sidebar
2. Go to **API** under the Project Settings section
3. Copy these three values:
   - **Project URL** (looks like `https://abcdefgh12345678.supabase.co`)
   - **anon public** API key (starts with `eyJ...`)
   - **service_role secret** API key (starts with `eyJ...`)
4. Paste them into your `.env.local` file (see [Environment Variables](#environment-variables))

### Step 3: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"**
6. Create another new query
7. Open `supabase/migrations/002_seed_data.sql`
8. Copy, paste, and run it

> ✅ You should see "Success. No rows returned" for both.

### Step 4: Configure Authentication

1. In Supabase, go to **Authentication** (left sidebar)
2. Go to **Providers**
3. Make sure **Email** is enabled
   - You can disable "Confirm email" for easier local development
4. (Optional) Enable **Google** and/or **GitHub** OAuth:
   - For Google: Go to [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials, add `http://localhost:3000/auth/callback` as an authorized redirect URI
   - For GitHub: Go to Settings → Developer settings → OAuth Apps, create one, add the same callback URL
   - Copy Client ID and Secret into Supabase provider settings
5. Go to **URL Configuration** (under Authentication → Settings)
   - Set **Site URL** to: `http://localhost:3000`
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs**

---

## Environment Variables

Create a file named `.env.local` in the root of the project:

```bash
cp .env.local.example .env.local
```

Then fill it in:

```env
# Supabase Configuration
# Get these from your Supabase project settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Replace the placeholder values with your actual Supabase credentials.**

> ⚠️ Never commit `.env.local` to git. It is already in `.gitignore`.

---

## Running the App

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Generate Supabase Types (Optional)

If you modify the database schema and want TypeScript types:

```bash
# Install Supabase CLI first: https://supabase.com/docs/guides/cli
npm run db:types
```

> Note: Replace `YOUR_PROJECT_REF` in `package.json` with your actual project reference (the part before `.supabase.co` in your URL).

---

## Feature Overview

### Authentication
- Email/password login and registration
- OAuth via Google and GitHub
- Auto-profile creation on signup
- Protected routes via middleware

### Goals
- Create personalized goals with title, description, category, priority, deadline, color
- Break goals into **Milestones**
- Break milestones into **Tasks**
- Track progress automatically
- Status indicators: 🟢 On Track, 🟡 At Risk, 🔴 Behind, ✅ Completed

### Tasks
- 5 difficulty levels: Tiny (5 XP), Easy (10 XP), Medium (25 XP), Hard (50 XP), Epic (100 XP)
- Standalone tasks or linked to goals
- Priority levels: Low, Medium, High
- Deadline tracking

### Habits
- Daily/weekly recurring habits
- Streak tracking
- 14-day mini calendar (GitHub-style contribution graph)
- Color-coded habit cards

### Gamification
- **XP System**: Earn XP for completing tasks, habits, milestones, and goals
- **Levels**: Level up automatically (formula: 100 × level² XP per level)
- **Streaks**: Track daily consistency
- **Achievements**: Unlock badges for milestones (12 pre-seeded)
- **Leagues**: Bronze → Silver → Gold → Platinum → Diamond
- **XP Toast**: Animated notification when you earn XP
- **Level-Up Modal**: Celebration animation with sparkles

### Goal Map
- Interactive **React Flow** visualization
- Nodes: Goals → Milestones → Tasks
- Color-coded by status
- Animated edges
- Zoom, pan, and mini-map
- Click goals to navigate

### Leaderboard
- Global rankings
- Top 3 podium display
- League badges
- Your rank highlighted
- XP progress bars

### Profile
- Avatar, username, bio
- Level and XP progress
- Stats grid (tasks, goals, habits, streak)
- XP breakdown by source
- Full achievements grid (unlocked + locked)

### Weekly Review
- Auto-aggregated weekly stats
- Tasks completed, XP earned, habits done, goals progressed
- Strongest and weakest areas
- List of all tasks crushed that week

### Challenges
- Join community challenges (e.g., 30-Day Coding Challenge)
- Log progress incrementally
- Auto-completes at 100% with bonus XP
- Tracks participation state

### Analytics (Recharts)
- **XP Over Time**: 14-day area chart
- **Tasks by Difficulty**: Bar chart
- **Goal Progress**: Horizontal bar chart
- **Habit Consistency**: 30-day heatmap

### Journal
- Mood-tracked entries (5 mood options)
- Tags support
- Chronological history
- Delete entries

### Settings
- Edit profile (username, name, bio)
- Location (country, city, timezone)
- Dark / Light theme toggle

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (extends `auth.users`) |
| `goals` | Personal goals |
| `milestones` | Goal sub-objectives |
| `tasks` | Actionable items |
| `habits` | Recurring daily/weekly habits |
| `habit_completions` | Daily habit check-ins |
| `xp_transactions` | Audit log of all XP gains (server-side) |
| `achievements` | Pre-defined achievement templates |
| `user_achievements` | Unlocked achievements per user |
| `friendships` | Social connections |
| `challenges` | Community challenges |
| `challenge_participants` | User challenge progress |
| `reflections` | Journal entries |
| `weekly_reviews` | Auto-generated weekly summaries |

### Key Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Triggers**: Auto-update timestamps, auto-create profile on signup
- **Functions**: `add_xp()` handles XP transactions and level-ups server-side
- **Indexes**: Optimized for common queries

---

## Troubleshooting

### "Failed to fetch" or connection errors
- Check that your `.env.local` values are correct
- Make sure your Supabase project is fully provisioned (not paused)
- Verify the `NEXT_PUBLIC_SUPABASE_URL` includes `https://`

### "Unauthorized" when trying to create data
- Make sure you are logged in
- Check that RLS policies were applied (run `001_initial_schema.sql` again)

### Styles not loading / looks broken
- Make sure Tailwind CSS is configured correctly
- Check that `globals.css` is imported in `app/layout.tsx`
- Run `npm install` again to ensure all dependencies are present

### Goal Map not rendering
- The Goal Map requires at least one goal with data
- Make sure `@xyflow/react` is installed: `npm ls @xyflow/react`

### XP not updating after completing a task
- XP is calculated server-side via the `add_xp` PostgreSQL function
- Check the `xp_transactions` table in Supabase to verify records are being created
- Refresh the page — the dashboard fetches fresh data on load

### Build errors
- Make sure you are using Node.js 18+
- Delete `.next` folder and try again: `rm -rf .next && npm run build`

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI component primitives |
| **Supabase** | PostgreSQL database, auth, real-time |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Data visualization |
| **React Flow** | Interactive node graphs |
| **Lucide React** | Icons |

---

## Project Structure

```
kaizen/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── goals/                # Goals list + detail + map
│   │   ├── tasks/                # Standalone task manager
│   │   ├── habits/               # Habit tracker
│   │   ├── challenges/           # Community challenges
│   │   ├── leaderboard/          # Rankings
│   │   ├── analytics/            # Charts & insights
│   │   ├── weekly-review/        # Weekly summary
│   │   ├── journal/              # Reflections
│   │   ├── profile/              # User profile
│   │   ├── settings/             # Account settings
│   │   └── layout.tsx            # Auth-protected layout
│   ├── auth/callback/            # OAuth callback handler
│   ├── actions.ts                # Server actions (CRUD + XP)
│   ├── globals.css               # Global styles + dark theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Login page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Sidebar, mobile nav
│   ├── auth/                     # Login form, user button
│   ├── dashboard/                # Dashboard widgets
│   ├── goals/                    # Goal cards, map, milestones, tasks
│   ├── tasks/                    # Task manager
│   ├── habits/                   # Habit tracker
│   ├── leaderboard/              # Rankings table
│   ├── profile/                  # Profile card, stats, achievements
│   ├── weekly-review/            # Weekly review card
│   ├── challenges/               # Challenge grid
│   ├── analytics/                # Charts dashboard
│   ├── journal/                  # Journal manager
│   ├── settings/                 # Settings form
│   └── xp/                       # XP toast, level-up modal
├── lib/
│   ├── supabase/                 # Client, server, middleware
│   └── utils.ts                  # Helpers, formatters
├── types/
│   └── index.ts                  # TypeScript definitions
├── supabase/migrations/
│   ├── 001_initial_schema.sql    # Full database schema
│   └── 002_seed_data.sql         # Achievements & challenges
├── package.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

---

## License

This project is built for personal use and learning. Feel free to modify and extend it.

---

## Next Steps / Ideas

- **AI Coach**: Integrate an LLM API to suggest goal breakdowns and daily planning
- **Push Notifications**: Remind users of habits and deadlines
- **Mobile App**: Convert to React Native or use PWA
- **Social Features**: Friend requests, activity feeds, direct messages
- **Custom Themes**: Let users pick accent colors beyond dark/light
- **Export Data**: CSV/JSON export of goals and tasks

---

**Built with ❤️ using Next.js + Supabase**
