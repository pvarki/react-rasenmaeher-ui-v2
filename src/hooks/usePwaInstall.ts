import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent;
  }
}

// iPadOS reports itself as a Mac, so touch points are the only tell.
export const isIos = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const isMtlsHost = (): boolean =>
  window.location.host.startsWith("mtls.");

const isInstalled = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.deferredInstallPrompt ?? null,
  );
  const [installed, setInstalled] = useState(isInstalled);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      window.deferredInstallPrompt = undefined;
      setPrompt(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    // A captured prompt is single use, whatever the user chose.
    window.deferredInstallPrompt = undefined;
    setPrompt(null);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      console.debug("Install prompt was already used");
    }
  };

  return {
    // Chrome prompts; iOS never does, so it gets written instructions instead.
    available: isMtlsHost() && !installed && (prompt !== null || isIos()),
    canPrompt: prompt !== null,
    install,
  };
}
