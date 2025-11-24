# Purseful - Finance Tracking & Budget Planning App

A complete offline PWA (Progressive Web App) for finance tracking and budget planning, built with Next.js, Tailwind CSS, and TypeScript.

## Features

- 💰 **Account Management**: Create and manage multiple accounts with different currencies
- 📊 **Transaction Tracking**: Track income, expenses, and transfers
- 📅 **Planned Transactions**: Schedule recurring transactions
- 🏷️ **Categories**: Organize transactions with custom categories
- 💱 **Multi-Currency Support**: Support for multiple currencies with exchange rate conversion
- 🌓 **Dark/Light Theme**: Beautiful themes with system preference detection
- 📱 **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- 💾 **Offline First**: All data stored locally, works completely offline
- 📤 **Export/Import**: Backup and restore your data

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

## PWA Icons

To complete the PWA setup, you need to add icon files:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

You can generate these using any image editor or online tool.

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
