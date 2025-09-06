# AI Migration Instructions: Next.js to Vite + React + TanStack Router

## Phase 1: Project Setup and Configuration

**Task 1.1: Initialize Vite + React project**
- [ ] Run `npm create vite@latest react-frontend -- --template react-ts` in the parent directory
- [ ] Navigate to the new project directory
- [ ] Install dependencies with `npm install`
- [ ] Verify the basic Vite setup works with `npm run dev`

**Task 1.2: Install and configure TanStack Router**
- [ ] Install TanStack Router: `npm install @tanstack/react-router @tanstack/router-devtools`
- [ ] Create `src/router.tsx` file with basic router configuration
- [ ] Create `src/routes/` directory for route components
- [ ] Create root route and home route files
- [ ] Update `src/main.tsx` to use the router

**Task 1.3: Install and configure Tailwind CSS**
- [ ] Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Run `npx tailwindcss init -p`
- [ ] Update `tailwind.config.js` with content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- [ ] Replace contents of `src/index.css` with Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`

**Task 1.4: Configure TypeScript and path mapping**
- [ ] Update `tsconfig.json` to include path mapping for `@/*` to `./src/*`
- [ ] Install `@types/node`: `npm install -D @types/node`
- [ ] Update `vite.config.ts` to include path resolution for the `@` alias

## Phase 2: Dependencies Migration

**Task 2.1: Install required dependencies**
- [ ] Copy the following dependencies from the Next.js `package.json` to the new `package.json`:
  - All `@radix-ui/*` packages
  - `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `embla-carousel-react`
  - `input-otp`, `lucide-react`, `react-day-picker`, `react-hook-form`
  - `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`
  - `tailwindcss-animate`, `vaul`, `zod`, `@hookform/resolvers`
- [ ] Install theme management: `npm install next-themes` (works with non-Next.js apps)
- [ ] Run `npm install` to install all dependencies

**Task 2.2: Configure fonts**
- [ ] Add Google Fonts Inter to `index.html`: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">`
- [ ] Update `src/index.css` to use Inter: `font-family: 'Inter', sans-serif;`

## Phase 3: Component Migration

**Task 3.1: Copy and modify layout component**
- [ ] Create `src/components/Layout.tsx`
- [ ] Copy content from `frontend/app/layout.tsx` but remove:
  - `import type { Metadata } from 'next'`
  - `export const metadata: Metadata = { ... }`
  - Geist font imports
  - `<Analytics />` component and import
- [ ] Keep the basic HTML structure but make it a React component

**Task 3.2: Copy and clean up components**
- [ ] Copy entire `frontend/components/` directory to `src/components/`
- [ ] In each component file, remove all `"use client"` directives
- [ ] Update any Next.js specific imports (there shouldn't be any based on current code)
- [ ] Ensure all import paths use the `@/` alias correctly

**Task 3.3: Copy and modify main page component**
- [ ] Copy `frontend/app/page.tsx` content to `src/routes/home.tsx`
- [ ] Remove the `export default function Home()` wrapper
- [ ] Create a proper route component structure for TanStack Router
- [ ] Import and use the BattleshipGame component

## Phase 4: Asset and Configuration Migration

**Task 4.1: Copy static assets**
- [ ] Copy all files from `frontend/public/` to the new project's `public/` directory
- [ ] Verify asset paths work correctly (they should work the same way)

**Task 4.2: Copy and update styles**
- [ ] Copy content from `frontend/app/globals.css`
- [ ] Append this content to the existing `src/index.css` (after the Tailwind directives)
- [ ] Remove any Next.js specific CSS if present

**Task 4.3: Copy utility files**
- [ ] Copy `frontend/lib/` directory to `src/lib/`
- [ ] Copy `frontend/hooks/` directory to `src/hooks/`
- [ ] Verify all imports in these files use relative paths or `@/` alias

## Phase 5: Configuration Files

**Task 5.1: Update Vite configuration**
- [ ] Ensure `vite.config.ts` includes:
  ```typescript
  import path from "path"
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  
  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
  ```

**Task 5.2: Create environment variables**
- [ ] Create `.env` file in project root
- [ ] Add `VITE_BACKEND_URL=http://localhost:3000` (or appropriate backend URL)
- [ ] Create `.env.example` file with the same structure but placeholder values

**Task 5.3: Update package.json scripts**
- [ ] Ensure package.json has these scripts:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "preview": "vite preview"
    }
  }
  ```

## Phase 6: Router Implementation

**Task 6.1: Create router configuration**
- [ ] Create `src/router.tsx` with TanStack Router setup
- [ ] Create `src/routes/__root.tsx` as the root route component
- [ ] Create `src/routes/index.tsx` for the home route
- [ ] Update `src/main.tsx` to use the router instead of rendering App directly

**Task 6.2: Set up route components**
- [ ] Move the battleship game content into the index route
- [ ] Ensure the Layout component wraps all routes
- [ ] Test that routing works correctly

## Phase 7: Testing and Verification

**Task 7.1: Development server verification**
- [ ] Run `npm run dev` and verify the application loads
- [ ] Test that all game functionality works identically to the Next.js version
- [ ] Verify hot reload works when making changes
- [ ] Check browser console for any errors

**Task 7.2: Build verification**
- [ ] Run `npm run build` and verify it completes without errors
- [ ] Run `npm run preview` to test the built application
- [ ] Verify the built app functions correctly

**Task 7.3: Cross-browser testing**
- [ ] Test in Chrome, Firefox, Safari, and Edge
- [ ] Verify responsive design works on mobile and desktop
- [ ] Check that all UI components render correctly

## Phase 8: Cleanup and Documentation

**Task 8.1: Remove unused files**
- [ ] Delete any Next.js specific configuration files that were copied
- [ ] Remove unused dependencies from package.json
- [ ] Clean up any temporary or backup files

**Task 8.2: Update documentation**
- [ ] Create or update README.md with:
  - Development setup instructions (`npm install`, `npm run dev`)
  - Build instructions (`npm run build`)
  - Environment variable setup
  - Project structure explanation

## Critical Implementation Notes for AI:
- Always check that imports work after copying files
- Test each phase before moving to the next
- Preserve all existing functionality - this is a migration, not a rewrite
- Use exact versions that are compatible with each other
- If any step fails, troubleshoot before continuing
- Maintain the same visual appearance and user experience

This format provides specific commands, file paths, and code snippets that an AI can execute directly. Each task is actionable and verifiable.
