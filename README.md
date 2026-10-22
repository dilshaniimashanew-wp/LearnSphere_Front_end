# LearnSphere Web

The web app for the LearnSphere learning management system. Students learn, instructors teach and admins moderate, each with their own area.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form + Zod, Vitest + Testing Library, Playwright + axe.
The API lives in the sibling repository `LearnSphere_BE`.

## Quick start

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev                  # http://localhost:3000
```

Start the API first (see its README) and seed it with `npm run seed:demo`. Set `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true`
to get one-click demo sign-in buttons on the login page.

## Scripts

| Command                           | What it does                                                         |
| --------------------------------- | -------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Develop, production build, serve the build                           |
| `npm test`                        | Unit and component tests (Vitest, jsdom)                             |
| `npm run e2e`                     | Real-browser tests with Playwright (see below)                       |
| `npm run check`                   | Lint, formatting, type check and unit tests: the same checks CI runs |
| `npm run lint`, `typecheck`       | ESLint, `tsc --noEmit`                                               |
| `npm run format` / `format:check` | Prettier                                                             |

## Browser (end-to-end) tests

They drive the real app and API, so both must be running with a freshly seeded database:

```bash
# in LearnSphere_BE
npm run seed:demo -- --reset --yes && npm run dev
# in this repo
npx playwright install chromium     # once
npm run dev
npm run e2e
```

What they cover:

- `workflow.spec.ts`: the whole life cycle through the UI. An instructor builds a course (including drag-and-drop lesson ordering and quiz editing), an admin rejects and then approves it, a student enrolls, learns, passes the quiz, submits work, gets graded, earns a certificate and reviews the course.
- `auth.spec.ts`: validation, route protection, role separation, session persistence, sign out, duplicate registration.
- `profile.spec.ts`: profile picture upload and removal, rename, password change.
- `a11y.spec.ts`: automated WCAG 2.1 A/AA audit (axe) of every public page and every signed-in page of each role.

The API's rate limits can throttle repeated runs; use a high `AUTH_RATE_LIMIT` and `API_RATE_LIMIT` in the API's local `.env`.

## How it is organised

```
src/
  app/                    Routes. (public), (auth) and (dashboard)/{student,instructor,admin}
  components/ui/          Small accessible building blocks (button, form fields, card, table, stars...)
  components/layout/      Navbar, footer, dashboard shell (role guard + sidebar), course card and banner
  features/<area>/        Screens and logic per feature (auth, courses, learning, instructor, profile...)
  lib/                    api client, data hooks, helpers
```

- **Data:** `useApi(path)` wraps TanStack Query (caching, retries for network errors only, stale-while-revalidate). `send()` performs a mutation and refreshes cached data. Cached data is cleared on sign in and sign out so users never see each other's data.
- **Sessions:** the API keeps the session in HttpOnly cookies, so no token touches JavaScript. When the 15 minute access token expires, `api()` refreshes once (shared between simultaneous requests) and retries the request.
- **Route guards** in the dashboard shell are a convenience; the API enforces every permission.
- **Forms** use React Hook Form with Zod schemas, with labelled fields and announced errors.
- **Accessibility:** semantic headings and landmarks, visible focus, keyboard alternatives to drag and drop, screen-reader labels for ratings and progress, contrast checked by axe.
- **Design:** light theme only. Colors are tokens in `src/app/globals.css`.

## Known limitations

- The role guard runs in the browser, so a signed-out visitor briefly sees a skeleton before being redirected. Server-side protection of pages would need a session check in Next.js middleware.
- File uploads for assignments are not implemented (links only).
