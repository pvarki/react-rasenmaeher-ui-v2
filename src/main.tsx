import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserTypeFetcher } from "./hooks/auth/userTypeFetcher";
import "@/config/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/config/i18n";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <UserTypeFetcher>
          <App />
          <Toaster position="top-center" richColors />
        </UserTypeFetcher>
      </QueryClientProvider>
    </I18nextProvider>
  </React.StrictMode>,
);
