import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/heebo/hebrew-400.css";
import "@fontsource/heebo/hebrew-500.css";
import "@fontsource/heebo/hebrew-600.css";
import "@fontsource/heebo/hebrew-700.css";
import "@fontsource/heebo/latin-400.css";
import "@fontsource/heebo/latin-500.css";
import "@fontsource/heebo/latin-600.css";
import "@fontsource/heebo/latin-700.css";
import "./index.css";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/toaster";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DirectionProvider dir="rtl">
      <App />
      <Toaster />
    </DirectionProvider>
  </StrictMode>
);
