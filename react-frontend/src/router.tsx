import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { BattleshipGame } from '@/components/battleship-game'
import { ThemeProvider } from '@/components/theme-provider'

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
  component: function Index() {
    return (
      <main className="p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">Battleship</h1>
            <p className="text-blue-700 dark:text-blue-300">Sink all enemy ships to win!</p>
          </div>
          <BattleshipGame />
        </div>
      </main>
    )
  },
})

const routeTree = rootRoute.addChildren([indexRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
