import "@fontsource-variable/rubik";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { load } from "./game/storage";
import "./index.css";
import { loadFirstLocale, LocaleProvider, pickLocale } from "./locales";
import "./update";

// A link that differs only in its names does not reload the page by itself.
window.addEventListener("hashchange", () => window.location.reload());

const root = document.getElementById("root")!;

loadFirstLocale(pickLocale(load<string>("locale"), navigator.languages)).then(
  initial =>
    createRoot(root).render(
      <StrictMode>
        <LocaleProvider initial={initial}>
          <App />
        </LocaleProvider>
      </StrictMode>
    ),
  () => {
    // No dictionary yet, so no translated text.
    const retry = document.createElement("button");
    retry.textContent = "↻";
    retry.ariaLabel = "Reload";
    retry.className = "mx-auto mt-[40dvh] block text-6xl";
    retry.onclick = () => window.location.reload();
    root.replaceChildren(retry);
  }
);
