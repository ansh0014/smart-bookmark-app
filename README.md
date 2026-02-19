# Smart Bookmark App

A full-stack bookmark management application built with Next.js and Supabase. Users can securely save, organize, and manage their favorite links with real-time synchronization.

## Overview

This application provides a simple and efficient way to manage bookmarks. It features Google OAuth authentication, real-time updates, and a clean, responsive interface.

## Features

- Google OAuth Authentication
- Add and delete bookmarks with URL and title
- Real-time synchronization across multiple tabs
- Private bookmarks per user
- Responsive design for desktop and mobile
- Keyboard shortcuts for quick actions

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Supabase (Authentication, Database, Real-time)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google Cloud Console account for OAuth setup

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase project:
   - Create a new project in Supabase
   - Configure Google OAuth in Authentication settings
   - Set up the database schema as required

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
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── supabase.ts
├── .env
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Environment Configuration

The application requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These can be found in your Supabase project settings under API.

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository

2. Import the project in Vercel:
   - Go to vercel.com and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in the project settings
   - Deploy

3. Update OAuth settings:
   - Add your Vercel deployment URL to Supabase authentication settings
   - Update Google Cloud Console with the new redirect URI

## Problems Encountered and Solutions

### Environment Variables Not Recognized

**Issue**: Application failed to start with "supabaseUrl is required" error despite environment variables being set.

**Solution**: Discovered that the environment variable name had a typo (`EXT_PUBLIC_SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`). After correction, the development server needed to be completely restarted for the changes to take effect, as Next.js only loads environment variables on startup.

### Real-time Updates Not Working

**Issue**: Newly added bookmarks did not appear immediately and required a page refresh.

**Solution**: Implemented immediate data fetching after successful insert operations. Also added optimistic UI updates to provide instant feedback before the server confirms the operation.

### TypeScript Configuration Issues

**Issue**: Path alias imports using `@/lib/supabase` were not resolving correctly.

**Solution**: Updated `tsconfig.json` to map the `@/*` alias to `./src/*` instead of `./*`, aligning with Next.js App Router conventions and project structure.

### Delete Operation Delays

**Issue**: Deleted bookmarks remained visible until page refresh.

**Solution**: Implemented optimistic updates by immediately removing the bookmark from the UI state, then performing the delete operation. Added error handling to rollback the UI change if the operation fails.

### Menu Interaction

**Issue**: Dropdown menu remained open when clicking outside of it.

**Solution**: Added an event handler with an invisible overlay that captures clicks outside the menu component and closes it appropriately.

## Usage

1. Sign in using your Google account
2. Click the hamburger menu to view your account information and sign out
3. Add bookmarks by entering a title and URL, then clicking "Add" or pressing Enter
4. Click on bookmark URLs to open them in a new tab
5. Delete bookmarks using the "Delete" button
6. Changes sync automatically across all open tabs

## Live Demo

[Your deployment URL here]

## License

This project is licensed under the MIT License.

## Author

[Your Anshul Jagota]  
[Your anshul.jagota@yahoo.com]  
