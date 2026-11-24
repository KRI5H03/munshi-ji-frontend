# Munshi Ji — Frontend

Web app for Munshi Ji, a GST invoicing and inventory system for garment traders in India. Minimal on the surface, built to be fast to use.

**Live app:** [https://munshi-ji-frontend.vercel.app/login]
**Backend repo:** [https://github.com/KRI5H03/munshi-ji-backend]

## Features

- Login and business-scoped sessions
- Create and manage contacts (parties) and items
- Create sale bills with automatic GST (CGST/SGST or IGST)
- View and print the bill PDF in the browser without downloading

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui, Base UI, Lucide icons
- TanStack Query for server state
- React Hook Form + Zod for forms and validation
- Sonner for toast notifications
- Vitest for testing
- Deployed on Vercel
- Talks to the Munshi Ji REST API (Render)

## Getting started

```bash
git clone [repo-url]
cd [repo-folder]
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

## Screenshots

[Add: login, sale bill form, bill PDF]

## Roadmap

- Purchase bills and party ledger
- GST summary reports
- Debit/credit notes

## Author

Krish Ramani — [GitHub](https://github.com/KRI5H03) · [X](https://x.com/krishramani03)
