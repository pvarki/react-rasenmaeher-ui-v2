import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "@/config/i18n";
import { UserTypeFetcher } from "./hooks/auth/userTypeFetcher";
import { BrowserGuard } from "@/components/BrowserGuard";

const router = createRouter({
  routeTree,
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserGuard>
          <UserTypeFetcher>
            <RouterProvider router={router} />
          </UserTypeFetcher>
        </BrowserGuard>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
