"use client";

import { useEffect, useState } from "react";
import {
  getRuntimeLocalization,
  type LocalizationConfig,
} from "@/config/localization";

export function useRuntimeLocalization() {
  const [config, setConfig] = useState<LocalizationConfig>(
    getRuntimeLocalization,
  );

  useEffect(() => {
    // Reload on config changes
    const interval = setInterval(() => {
      const updated = getRuntimeLocalization();
      setConfig(updated);
    }, 1000); // Check every second for updates

    return () => clearInterval(interval);
  }, []);

  return config;
}
