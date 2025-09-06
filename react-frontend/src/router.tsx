import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from '@/components/theme-provider';
import { CreateUserNamePage } from './routes';
import { GameRoomsPage } from './routes/game-rooms';
import { GamePage } from './routes/battleship-game';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <Outlet />
      </div>
    </ThemeProvider>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <CreateUserNamePage />,
});

const gameRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game-rooms',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      username: (search.username as string) || '',
    }
  },
  component: () => <GameRoomsPage />,
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game/:id',
  component: () => <GamePage />,
});

const routeTree = rootRoute.addChildren([indexRoute, gameRoute, gameRoomsRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
