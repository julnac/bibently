# Bibently - Web Frontend

Bibently is a modern, event-discovery platform designed with a premium, Airbnb-inspired user interface. This repository contains the Next.js web application (`web-next`) serving as the frontend for the project. Additionaly in `mobile-frontend` is a mobile aplication in ReactNative.

## Demo on vercel

https://bib-orcin.vercel.app/

## Features

- **Interactive Event Map**: A split-screen layout featuring a dynamic map on the right and an event list on the left.
- **Advanced 3-Step Search Filter**: A sleek, animated filter bar (Where, When, Price) that seamlessly updates URL query parameters without layout shifts.
- **Premium UI/UX**: Designed with aesthetics in mind — smooth CSS typography, micro-interactions, distinct glassmorphic elements, and a clean interface.
- **Real-Time Filtering**: Instant updates to events based on location, dates, price range, and custom sorting (e.g., closest date, attendance, distance).
- **URL State Synchronization**: Search state relies on URL parameters ensuring all filtered views are shareable.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS modules (`globals.css`)
- **State Management & Fetching**: React Query (`@tanstack/react-query`) + Zustand (for UI states like `useMapInteractionStore`)
- **URL Sync**: [`nuqs`](https://nuqs.47ng.com/) for type-safe query parameters
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: `date-fns` & `react-day-picker`
- **Map**: Mapbox GL JS / React Map GL (planned/integrated via interactive map components)

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and your preferred package manager installed.

### Installation

1. Clone the repository and navigate to the `web-next` folder:
   ```bash
   cd bibently-app/bibently.application/web-next
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn / pnpm
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root of the `web-next` directory and add your required keys (e.g., API URL, Mapbox token).

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   # NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts.
- `src/components/` - Reusable UI components:
- `features/` - Domain-specific components (e.g., `event-list`, `navigation`, `filters`).
- `src/hooks/` - Custom React hooks (e.g., `useSearchFilters`, `useEvents`).
- `src/store/` - Zustand stores for global state.
- `src/types/` - TypeScript interface definitions for API responses and business logic.
- `src/utils/` - Helper functions across the app.

## License

This project is proprietary. All rights reserved.



