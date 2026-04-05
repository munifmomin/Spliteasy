# SplitEasy

A web-based expense splitting app built with Next.js, Supabase, and Vercel.

---

## Stack

- **Next.js 14** (App Router) — frontend + API
- **Supabase** — PostgreSQL database + auth
- **Vercel** — hosting + deployments
- **Tailwind CSS** — styling

---

## Getting Started

### 1. Clone / extract this project

Place the project folder where you want it locally.

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://mgbmpsedtbkylpzcasck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your anon key from:
**Supabase Dashboard → Project Settings → API → Project API keys → anon public**

### 4. Run the database schema

Go to **Supabase Dashboard → SQL Editor → New query**, paste the full schema SQL (from the project plan doc), and click Run.

### 5. Enable Email Auth in Supabase

Go to **Authentication → Providers → Email** and make sure it's enabled.

Optionally disable "Confirm email" during development:
**Authentication → Email → Confirm email → toggle off**

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial SplitEasy scaffold"
gh repo create spliteasy --public --push
```

(Or create the repo manually on github.com and push)

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

Your app will be live at a `.vercel.app` URL instantly.

---

## Project Structure

```
spliteasy/
├── app/
│   ├── auth/actions.ts          # Server actions for sign in/out
│   ├── dashboard/page.tsx       # Groups overview
│   ├── groups/
│   │   ├── new/page.tsx         # Create group
│   │   └── [id]/
│   │       ├── page.tsx         # Group detail (expenses + balances)
│   │       └── add-expense/     # Add expense form
│   ├── join/[code]/page.tsx     # Join via invite link
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── groups/
│       ├── BalancePanel.tsx     # Direct + simplified debt views
│       └── InviteButton.tsx     # Copy invite link
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server client
│       └── middleware.ts        # Session refresh
├── types/
│   └── database.ts              # TypeScript types for all tables
├── middleware.ts                 # Route protection
└── .env.local.example
```

---

## What's Built (Phase 1 + 2)

- ✅ Sign up / login / logout
- ✅ Create groups
- ✅ Invite members via shareable link
- ✅ Join groups via invite link
- ✅ Add expenses (equal or custom split)
- ✅ Balance calculation — direct view
- ✅ Balance calculation — simplified view (minimize transactions)
- ✅ Expense list per group

## Coming Next (Phase 3)

- Activity log
- Mark settlements as paid + confirmation
- Mobile polish
- Empty states + loading skeletons
