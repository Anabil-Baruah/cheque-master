# Welcome to your check management system

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the backend API (Express) in another terminal.
npm run dev:server

# Step 5: Start the Next.js development server.
npm run dev

# If port 3000 is busy, run on a different port:
npx next dev -p 3001
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Next.js (App Router)
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express.js (REST API)
- Supabase (authentication client)

## Environment variables

Create `.env` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

For production, set `NEXT_PUBLIC_API_BASE_URL` to your deployed API base URL.

## Development

- Backend API: `npm run dev:server` (http://localhost:4000)
- Frontend app: `npm run dev` (http://localhost:3000)

## Production

```sh
# Build the Next.js app
npm run build

# Start the Next.js app
npm start

# Start the API (in a second terminal or process manager)
node ./server/index.mjs
```

## Project structure notes

- App Router pages live under `src/app/*/page.tsx`.
- UI screens are implemented in `src/pages/*` and re-exported via `src/views/*` for consumption by App Router.
- Supabase client is configured for client-side usage and guarded for SSR.

