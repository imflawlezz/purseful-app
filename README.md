# Purseful

Purseful is a finance tracking and budget planning app that runs fully offline thanks to its PWA architecture. It is built with Next.js, Tailwind CSS, and TypeScript.

## Live Demo

Try the latest deployment on Vercel: https://purseful-app.vercel.app/

## Features

- **Account management** – create and manage multiple accounts with different currencies
- **Transaction tracking** – log income, expenses, and transfers
- **Planned transactions** – schedule future or recurring transactions
- **Categories** – organize spending with custom categories
- **Multi-currency support** – convert using the built-in exchange-rate helpers
- **Theme support** – automatic dark/light theme with manual override
- **Responsive UI** – optimized layouts for phones, tablets, and desktops
- **Offline-first storage** – all data lives in the browser using local storage
- **Data portability** – export and import data as JSON backups

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library
- **LocalStorage** - Data persistence

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## PWA Assets

The repository includes the required PWA assets:
- `public/icon-192.png`
- `public/icon-192-maskable.png`
- `public/icon-512.png`
- `public/icon-512-maskable.png`
- `public/manifest.json`

## Building for Production

```bash
npm run build
npm start
```

## Data Storage

All data is stored locally in the browser's localStorage. To backup your data:
1. Go to Settings
2. Click "Export Data"
3. Save the JSON file

To restore:
1. Go to Settings
2. Click "Import Data"
3. Select your backup JSON file

## License

MIT
