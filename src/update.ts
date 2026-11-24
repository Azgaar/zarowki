import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

// A new version is downloaded in the background, but it is used only on screens that allow it:
// a reload during a game could change the cards and the prompts for one device.
let registration: ServiceWorkerRegistration | undefined;
let ready = false;
let allowed = false;

const applyUpdate = registerSW({
  immediate: true,
  onNeedRefresh() {
    ready = true;
    apply();
  },
  onRegisteredSW(_url, r) {
    registration = r;
  }
});

function apply(): void {
  if (ready && allowed) void applyUpdate(true);
}

async function check(): Promise<void> {
  try {
    await registration?.update();
  } catch {
    // Offline: the current version still works.
  }
}

/** While the screen is shown, a new version is looked for and used as soon as it is ready. */
export function useAppUpdates(): void {
  useEffect(() => {
    const onShow = () => {
      if (!document.hidden) void check();
    };
    allowed = true;
    apply();
    void check();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      allowed = false;
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);
}

/** For a button: gets the new version if there is one. */
export async function updateNow(): Promise<void> {
  await check();
  const worker = registration?.installing;
  if (ready || worker) apply(); // Reloads by itself once the new version is installed.
  else window.location.reload();
}
