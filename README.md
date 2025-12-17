# AI-Assisted Tender Management System

A production-ready Next.js application for tender intake, AI analysis, and proposal generation.

## 🚀 Technologies

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** React Icons (Remix Icons)
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Backend:** Next.js API Routes
- **Data:** JSON File-based persistence (Local)

## 🛠 Setup & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open Application:**
    -   Landing: [http://localhost:3000](http://localhost:3000)
    -   Client Portal: [http://localhost:3000/client](http://localhost:3000/client)
    -   Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📂 Project Structure

```
/
├── app/
│   ├── api/            # Backend API Routes
│   ├── client/         # Client Portal Page
│   ├── admin/          # Admin Portal Page
│   ├── page.tsx        # Landing Page
│   └── globals.css     # Global Styles
├── components/
│   ├── ui/             # Reusable UI Components
│   ├── client/         # Client Portal Components
│   └── admin/          # Admin Portal Components
├── lib/
│   ├── tenderService.ts # Core Business Logic
│   └── utils.ts        # Helper Functions
├── types/              # TypeScript Interfaces
├── data/               # Data Storage (tenders.json, uploads/)
└── public/             # Static Assets
```

## 🌟 Key Features

1.  **Client Portal:**
    -   Submit tenders with file uploads.
    -   Real-time status tracking.
    -   Proposal review interface.

2.  **Admin Portal:**
    -   Dashboard of all tenders.
    -   **AI Analysis:** Automatic scoring of relevance, feasibility, and delivery capability.
    -   **Auto-Proposals:** AI-generated proposal drafts based on analysis.
    -   Proposal editor and submission workflow.

3.  **System:**
    -   "Lazy" AI Analysis simulation (updates on read).
    -   Real-time synchronization via polling.
    -   Secure file handling.

## ⚠️ Note on Persistence

This application uses a local JSON file (`data/tenders.json`) for data persistence. This works perfectly for local development and demos. For serverless deployment (e.g., Vercel), this layer should be replaced with a database (PostgreSQL/Supabase).
