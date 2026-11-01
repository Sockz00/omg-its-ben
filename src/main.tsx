import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App";
import { initLenis } from "./lib/motion";

// smooth scrolling (same as the original: new Lenis({ autoRaf: true }))
initLenis();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
