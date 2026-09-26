export interface LocalizationConfig {
  common?: {
    copyright?: string;
  };
  [key: string]: unknown;
}

let runtimeConfig: LocalizationConfig = {};

export function setRuntimeLocalization(config: LocalizationConfig) {
  runtimeConfig = deepMerge(runtimeConfig, config);
}

function deepMerge(
  target: LocalizationConfig,
  source: LocalizationConfig,
): LocalizationConfig {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(
        (target[key] as LocalizationConfig) || {},
        source[key] as LocalizationConfig,
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function getRuntimeLocalization(): LocalizationConfig {
  return runtimeConfig;
}

export function getLocalizedValue(path: string, defaultValue = ""): string {
  const keys = path.split(".");
  let value: unknown = runtimeConfig;

  for (const key of keys) {
    if (typeof value === "object" && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }

  return typeof value === "string" ? value : defaultValue;
}
