import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WebPlaydaryProvider } from "./lib/playdary";
import { applyStoredTheme } from "./lib/theme";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });
const queryClient = new QueryClient();

applyStoredTheme();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebPlaydaryProvider>
        <RouterProvider router={router} />
      </WebPlaydaryProvider>
    </QueryClientProvider>
  </StrictMode>,
);
