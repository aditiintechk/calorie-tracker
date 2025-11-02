# Calorie Tracker

A Progressive Web App (PWA) built with Next.js, TypeScript, and Tailwind CSS for tracking daily calorie intake on iOS and Android.

## Features

-   ✅ Track daily calorie intake
-   ✅ Add and delete food entries
-   ✅ **AI-powered calorie calculation** using OpenAI GPT-4o-mini
-   ✅ View daily calorie summary with progress
-   ✅ PWA support for iOS and Android
-   ✅ Local storage persistence
-   ✅ Modern, responsive UI

## Getting Started

### Prerequisites

-   Node.js 18+ and npm
-   OpenAI API key (for AI calorie calculation)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory and add your OpenAI API key:

```env
OPENAI_KEY=your_openai_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## PWA Setup

### Icon Files

You'll need to create PWA icon files:

-   `public/icon-192x192.png` (192x192 pixels)
-   `public/icon-512x512.png` (512x512 pixels)
-   `public/favicon.ico`

You can generate these using online tools or image editors. For now, the app will work without them, but icons are required for proper PWA installation.

### PWA Installation

#### iOS

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

#### Android

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"

## AI Calorie Calculation

The app uses OpenAI's GPT-4o-mini to automatically calculate calories from meal descriptions. Simply enter a meal description (e.g., "4 Idlis & 100g Coconut Chutney") and click "Calculate Calories with AI" to get an accurate calorie count. You can still manually edit the calories if needed.

## Tech Stack

-   **Next.js 14** - React framework
-   **TypeScript** - Type safety
-   **Tailwind CSS** - Styling
-   **next-pwa** - PWA functionality
-   **OpenAI GPT-4o-mini** - AI calorie calculation

## License

MIT
