import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MockupB from "./MockupB";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <MockupB />
  </StrictMode>,
);
