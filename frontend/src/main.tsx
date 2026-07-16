import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "react-hot-toast";

import App from "./App";
import AuthProvider from "./providers/AuthProvider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </AuthProvider>
  </StrictMode>
);
