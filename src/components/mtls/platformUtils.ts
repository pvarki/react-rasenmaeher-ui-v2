export function getOperatingSystem(): string {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];

  if (macosPlatforms.indexOf(platform) !== -1) {
    return "MacOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    return "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    return "Windows";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (/Linux/.test(platform)) {
    return "Linux";
  }

  return "Unknown";
}

export interface PlatformInstructions {
  steps: string[];
  notes?: string[];
}

export const PLATFORM_INSTRUCTIONS: Record<string, PlatformInstructions> = {
  Windows: {
    steps: [
      "mtlsInstall.platforms.Windows.steps.1",
      "mtlsInstall.platforms.Windows.steps.2",
      "mtlsInstall.platforms.Windows.steps.3",
      "mtlsInstall.platforms.Windows.steps.4",
      "mtlsInstall.platforms.Windows.steps.5",
      "mtlsInstall.platforms.Windows.steps.6",
      "mtlsInstall.platforms.Windows.steps.7",
    ],
    notes: [
      "mtlsInstall.platforms.Windows.notes.1",
      "mtlsInstall.platforms.Windows.notes.2",
    ],
  },
  MacOS: {
    steps: [
      "mtlsInstall.platforms.MacOS.steps.1",
      "mtlsInstall.platforms.MacOS.steps.2",
      "mtlsInstall.platforms.MacOS.steps.3",
      "mtlsInstall.platforms.MacOS.steps.4",
      "mtlsInstall.platforms.MacOS.steps.5",
    ],
    notes: [
      "mtlsInstall.platforms.MacOS.notes.1",
      "mtlsInstall.platforms.MacOS.notes.2",
    ],
  },
  Linux: {
    steps: [
      "mtlsInstall.platforms.Linux.steps.1",
      "mtlsInstall.platforms.Linux.steps.2",
      "mtlsInstall.platforms.Linux.steps.3",
      "mtlsInstall.platforms.Linux.steps.4",
    ],
    notes: [
      "mtlsInstall.platforms.Linux.notes.1",
      "mtlsInstall.platforms.Linux.notes.2",
    ],
  },
  Android: {
    steps: [
      "mtlsInstall.platforms.Android.steps.1",
      "mtlsInstall.platforms.Android.steps.2",
      "mtlsInstall.platforms.Android.steps.3",
      "mtlsInstall.platforms.Android.steps.4",
      "mtlsInstall.platforms.Android.steps.5",
      "mtlsInstall.platforms.Android.steps.6",
    ],
    notes: [
      "mtlsInstall.platforms.Android.notes.1",
      "mtlsInstall.platforms.Android.notes.2",
    ],
  },
  iOS: {
    steps: [
      "mtlsInstall.platforms.iOS.steps.1",
      "mtlsInstall.platforms.iOS.steps.2",
      "mtlsInstall.platforms.iOS.steps.3",
      "mtlsInstall.platforms.iOS.steps.4",
      "mtlsInstall.platforms.iOS.steps.5",
      "mtlsInstall.platforms.iOS.steps.6",
      "mtlsInstall.platforms.iOS.steps.7",
    ],
    notes: [
      "mtlsInstall.platforms.iOS.notes.1",
      "mtlsInstall.platforms.iOS.notes.2",
    ],
  },
};

export function getMtlsUrl(): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  let mtlsHostname = hostname;
  if (!hostname.startsWith("mtls.")) {
    mtlsHostname = `mtls.${hostname}`;
  }

  return `${protocol}//${mtlsHostname}${port ? `:${port}` : ""}/`;
}
