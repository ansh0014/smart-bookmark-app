# Smart Bookmark App

A full-stack bookmark management application built with Next.js and Supabase. Users can securely save, organize, and manage their favorite links with real-time synchronization.

## Overview

This application provides a simple and efficient way to manage bookmarks. It features Google OAuth authentication, real-time updates, and a clean, responsive interface.

## Features

- Google OAuth Authentication
- Add and delete bookmarks with URL and title
- Real-time synchronization across multiple tabs
- Private bookmarks per user (Row Level Security)
- Responsive design for desktop and mobile
- Keyboard shortcuts for quick actions
- Server-side authentication handling

## Tech Stack

**Frontend**
- Next.js 16 (App Router with Turbopack)
- TypeScript
- Tailwind CSS
- React 19

**Backend**
- Supabase (Authentication, Database, Real-time)
- Supabase SSR (@supabase/ssr)

**Deployment**
- Vercel (Production hosting)
- GitHub (Version control)

## Prerequisites

- Node.js (v20 or higher)
- npm
- Supabase account
- Google Cloud Console account for OAuth setup
- Vercel account (for deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ansh0014/smart-bookmark-app.git
cd smart-bookmark-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase project:
   - Create a new project in Supabase
   - Configure Google OAuth in Authentication settings
   - Set up the database schema (see Database Schema section)
   - Enable Row Level Security policies

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main page component
│   └── lib/
│       ├── supabase.ts               # Client-side Supabase client
│       └── supabase-server.ts        # Server-side Supabase client
├── .env.local                        # Local environment variables (not committed)
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore rules
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── vercel.json                       # Vercel deployment configuration
└── package.json                      # Project dependencies
```

## Database Schema

### Bookmarks Table

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

## Deployment

### Vercel Deployment Steps

1. **Install Vercel CLI and link project:**
```bash
npm install -g vercel
npx vercel link
```

2. **Add environment variables to Vercel:**
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add for Production, Preview, and Development:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Update Supabase Authentication settings:**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

4. **Update Google OAuth settings:**
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-supabase-id.supabase.co/auth/v1/callback`

5. **Deploy:**
```bash
npx vercel --prod
```

## Key Problems Faced & Solutions

### 1. Environment Variables Not Loading

**Problem:** App crashed with "supabaseUrl is required" error even though `.env.local` existed.

**Root Cause:** Variable was named `EXT_PUBLIC_SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL` (missing 'N').

**Solution:**
- Fixed the typo in `.env.local`
- Completely restarted the dev server (Next.js only loads env vars on startup)
- Verified all environment variables start with `NEXT_PUBLIC_` prefix

### 2. OAuth Authentication Failing

**Problem:** After Google sign-in, got "requested path is invalid" error and authentication didn't complete.

**Root Cause:** Missing callback handler to process OAuth response from Supabase.

**Solution:**
- Created `/src/app/auth/callback/route.ts` to handle the callback
- Used server-side Supabase client to exchange authorization code for session
- Properly configured redirect URLs in both Supabase and Google Console

### 3. Client/Server Component Mixing Error

**Problem:** Build failed with error about importing `next/headers` in client components.

**Root Cause:** Single Supabase client file used server-only imports alongside client components.

**Solution:**
- Split into two files:
  - `supabase.ts` - Client-side using `createBrowserClient`
  - `supabase-server.ts` - Server-side using `createServerClient` with cookies
- Used appropriate client in each context (client components vs API routes)

### 4. Vercel Deployment Security Error

**Problem:** Deployment failed with "Vulnerable version of Next.js detected (CVE-2025-66478)".

**Solution:**
```bash
npm install next@latest
npm install react@latest react-dom@latest
```
Updated to Next.js 16.1.6+ which fixed the security vulnerability.

### 5. Environment Variables Missing in Vercel Build

**Problem:** Vercel deployment built successfully locally but failed on Vercel with missing environment variables.

**Root Cause:** Environment variables need to be explicitly added in Vercel dashboard.

**Solution:**
- Added both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings
- Selected all three environments (Production, Preview, Development)
- Redeployed after adding variables

### 6. Real-time Updates Not Working

**Problem:** New bookmarks didn't appear until page refresh.

**Solution:**
- Implemented immediate data fetching after successful insert
- Added optimistic UI updates for instant feedback
- Used Supabase real-time subscriptions for cross-tab synchronization

## Live Demo

[https://smart-bookmark-app-six-ruby.vercel.app](https://smart-bookmark-app-six-ruby.vercel.app)

## Usage

1. Sign in using your Google account
2. Click the hamburger menu to view your account information and sign out
3. Add bookmarks by entering a title and URL, then clicking "Add" or pressing Enter
4. Click on bookmark URLs to open them in a new tab
5. Delete bookmarks using the "Delete" button
6. Changes sync automatically across all open tabs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Anshul Jagota**  
Email: anshul.jagota@yahoo.com  
GitHub: [@ansh0014](https://github.com/ansh0014)

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Vercel for hosting and deployment
