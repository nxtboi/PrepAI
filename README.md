# PrepAI

PrepAI is a React + Vite study assistant built to generate exam-style questions, solve doubts, and surface topic notes and analytics using the Google Gemini AI model.

## Key Features

- Login / Signup / Password Reset UI (mock authentication via `localStorage`)
- Dashboard with quick navigation to study tools
- Question bank generation with AI-powered content creation
- Doubt solver for exam-style questions and explanations
- Topic notes generator and study summary features
- Analytics page for performance and study insights
- Profile page and admin route support

## Tech Stack

- React 19
- Vite 6
- TypeScript
- React Router DOM
- Recharts
- Google Gemini AI via `@google/genai`

## Project Structure

- `App.tsx` — app routes, auth flow, and main layout wiring
- `components/` — reusable UI components, auth forms, layout and widgets
- `pages/` — functional pages like `Dashboard`, `QBankGenerator`, `DoubtSolver`, `Analytics`, etc.
- `services/geminiService.ts` — Gemini API integration and question generation logic
- `data/syllabus.ts` — exam syllabus data used for topic generation
- `types.ts` — shared TypeScript types
- `vercel.json` — rewrite configuration for static deployment

## Setup

### Prerequisites

- Node.js installed (version 18+ recommended)

### Install

1. Open a terminal in the project root
2. Install dependencies:

```bash
npm install
```

### Configure the API key

Create a file named `.env.local` in the project root and add your Gemini API key:

```env
API_KEY=your_gemini_api_key_here
```

> `services/geminiService.ts` requires `process.env.API_KEY` to be set at runtime.

### Run locally

```bash
npm run dev
```

Open the app at the URL shown in the terminal, typically `http://localhost:3000`.

## Build and Preview

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This app includes `vercel.json` with a rewrite rule to serve `index.html` for all routes.

You can deploy to Vercel or any static hosting provider that supports Vite apps.

## Notes

- Authentication is currently mocked in the browser using `localStorage`.
- The admin page is only available when the logged-in user has `isAdmin: true`.
- The AI integration uses the Gemini Flash preview model and returns structured JSON for questions and priority topics.

## Troubleshooting

- If the app fails to start, verify `.env.local` exists and `API_KEY` is defined.
- If Gemini calls fail, check the API key validity and network access.

## Useful Commands

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run preview` — preview production build locally

---

Enjoy building and improving the PrepAI study experience!
