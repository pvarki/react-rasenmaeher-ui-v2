import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserTypeFetcher } from "./hooks/auth/userTypeFetcher";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserTypeFetcher>
        <App />
        <Toaster position="top-center" richColors />
      </UserTypeFetcher>
    </QueryClientProvider>
  </React.StrictMode>,
);
