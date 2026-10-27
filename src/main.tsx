import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useLocaleReady } from "./i18n/index.ts";

function Root() {
  return useLocaleReady() ? <App /> : null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
