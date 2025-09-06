# Battleship Game - React Frontend

A React-based Battleship game migrated from Next.js to Vite + React + TanStack Router.

## Features

- Interactive Battleship game with AI opponent
- Responsive design with dark/light theme support
- Built with modern React, TypeScript, and Tailwind CSS
- Fast development with Vite
- Routing with TanStack Router

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 4.5.3
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI
- **State Management**: React hooks
- **Theme**: next-themes for dark/light mode

## Development Setup

### Prerequisites

- Node.js 18.19+ (note: some warnings appear with Node 18, but the app works fine)
- npm

### Installation

1. Clone the repository and navigate to the react-frontend directory:
```bash
cd react-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Build Instructions

To build the application for production:

```bash
npm run build
```

To preview the built application:

```bash
npm run preview
```

The preview will be available at `http://localhost:4173/`

## Environment Variables

- `VITE_BACKEND_URL`: Backend API URL (default: http://localhost:3000)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix UI based)
│   ├── battleship-game.tsx    # Main game component
│   ├── game-board.tsx         # Game board component
│   └── theme-provider.tsx     # Theme provider
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── router.tsx          # TanStack Router configuration
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built application
- `npm run lint` - Run ESLint

## Game Instructions

1. **Ship Placement Phase**: Click and drag to place your ships on the board
2. **Battle Phase**: Click on enemy board cells to attack
3. **Victory**: Sink all enemy ships to win!

## Migration Notes

This application was successfully migrated from Next.js to Vite + React while maintaining:
- All original functionality
- Visual design and user experience
- Component structure and logic
- TypeScript type safety

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Issues

- Some peer dependency warnings with React 19 and older packages (vaul@0.9.9)
- Minor TypeScript warnings that don't affect functionality

## Performance

- Fast HMR (Hot Module Replacement) with Vite
- Optimized production builds
- Lazy loading and code splitting ready
