# Spendly — Budget Tracker MVP

A mobile-first PWA budgeting app built with React, Ionic, and Capacitor.

## Stack

- **Vite** — build tool
- **React 18 + TypeScript** — UI
- **Ionic React** — mobile UI components
- **Capacitor** — native iOS/Android wrapper
- **localStorage** — offline-first data persistence

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in browser (dev mode)

```bash
npm run dev
```

Open http://localhost:5173

### 3. Build for production

```bash
npm run build
```

### 4. Deploy to native (optional)

```bash
# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

## Features (MVP)

- **Dashboard** — balance overview, budget progress, recent transactions
- **Transactions** — full list with search, grouped by date, delete support
- **Add Transaction** — expense/income toggle, category picker, note, date
- **Budgets** — set per-category monthly limits with live progress bars
- **Settings** — currency selector, data management

## Default Categories

Food & Dining, Transport, Shopping, Housing, Health, Entertainment, Utilities, Savings, Income, Other

## Project Structure

```
src/
├── pages/          # All 5 screens
├── hooks/          # useStorage hooks (reactive data layer)
├── store/          # localStorage read/write logic
├── types/          # TypeScript interfaces
└── theme/          # Global CSS variables + Ionic overrides
```

## Next Steps (Post-MVP)

- Push notifications for budget alerts
- Recurring transactions
- Monthly reports with charts
- Export to CSV
- Biometric lock
- Multi-currency per transaction
```
