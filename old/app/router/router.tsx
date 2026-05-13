import {
    Outlet,
    RouterProvider,
    createRootRoute,
    createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MainLayout } from "@/app/layouts";

import * as TanStackQueryProvider from "@/app/integrations/tanstack-query/root-provider.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { IndexPage } from "@/pages";

const rootRoute = createRootRoute({
    component: () => (
        <MainLayout>
            <Outlet />
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
        </MainLayout>
    ),
});

const routeTree = rootRoute.addChildren([IndexPage(rootRoute)]);

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
    routeTree,
    context: {
        ...TanStackQueryProviderContext,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const AppRouter: React.FC = () => {
    return (
        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
            <RouterProvider router={router} />
        </TanStackQueryProvider.Provider>
    );
};

export default AppRouter;
