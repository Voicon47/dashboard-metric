# Server Metrics Dashboard

A modern, real-time dashboard for monitoring server performance, queue status, and API endpoint health.

## 🚀 Features
- **Real-time Monitoring**: Track CPU, RAM, Latency, and Requests Per Second (RPS) across multiple servers.
- **Endpoint Analysis**: Detailed analytics for individual API endpoints, including top latencies, error rates (4xx, 5xx), and success rates.
- **Queue Tracking**: Visual gauges representing real-time queue sizes.
- **Dynamic Filtering**: Robust filter system by HTTP methods, performance metrics, and specific servers.
- **Modern UI**: Fully responsive, card-based layout with Tooltips and Dark/Light mode support.

## 🛠️ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (Persisted Store)
- **Styling**: Tailwind CSS + Radix UI Primitives
- **Icons**: Lucide React
- **API Client**: Axios

## 📦 Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation & Setup

1. Install project dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`.

## 📁 Project Structure Overview
- `/src/components` - Reusable UI Components (Tables, Matrices, Gauges, Filters)
- `/src/store` - Zustand state stores (`useServerStore`, `useUIStore`)
- `/src/api` - API endpoints configuration and fetching logic
- `/src/hooks` - Custom React hooks
- `/src/utils` - Helper functions and data normalization logic
