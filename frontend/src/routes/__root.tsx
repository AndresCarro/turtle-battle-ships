import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: () => (
        <div className="h-screen overflow-hidden flex flex-col gap-6 items-center justify-start bg-[url('/background.jpg')] bg-cover p-8">
            <Outlet />
        </div>
    )
})
