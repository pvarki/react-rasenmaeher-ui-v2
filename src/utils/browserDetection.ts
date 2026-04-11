export interface BrowserInfo {
  isSupported: boolean;
  browserName: string;
  browserType: "standard" | "privacy-focused" | "in-app" | "unknown";
  recommendedAction?: string;
}

/**
 * Detects if the browser is an in-app browser (e.g., Facebook, Instagram, Gmail, LinkedIn)
 */
export function isInAppBrowser(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || "";

  const inAppPatterns = [
    /FBAN|FBAV/i,
    /Instagram/i,
    /Line\//i,
    /Snapchat/i,
    /Twitter/i,
    /LinkedIn/i,
    /GoogleApp/i,
    /Gmail/i,
    /WhatsApp/i,
    /Messenger/i,
    /Telegram/i,
    /WeChat/i,
    /MicroMessenger/i,
    /Puffin/i,
    /SamsungBrowser/i,
  ];

  return inAppPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Detects if the browser is DuckDuckGo
 */
export function isDuckDuckGo(): boolean {
  const userAgent = navigator.userAgent || "";
  return /DuckDuckGo/i.test(userAgent) || /ddg\//i.test(userAgent);
}

/**
 * Detects if the browser is a privacy-focused browser that may have restrictions
 */
export function isPrivacyFocusedBrowser(): boolean {
  const userAgent = navigator.userAgent || "";

  const privacyBrowsers = [
    /Brave/i,
    /DuckDuckGo/i,
    /ddg\//i,
    /Firefox Focus/i,
    /Tor Browser/i,
  ];

  return privacyBrowsers.some((pattern) => pattern.test(userAgent));
}

/**
 * Detects if the browser is a supported mainstream browser (Chrome, Safari, Firefox, Edge)
 */
export function isSupportedBrowser(): boolean {
  const userAgent = navigator.userAgent || "";

  if (isInAppBrowser()) {
    return false;
  }

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  if (isIOS) {
    const isSafari =
      /Safari/i.test(userAgent) &&
      !/Chrome/i.test(userAgent) &&
      !/CriOS/i.test(userAgent) &&
      !/FxiOS/i.test(userAgent);
    return isSafari;
  }

  const isChrome =
    /Chrome/i.test(userAgent) &&
    !/Edge|Edg/i.test(userAgent) &&
    !/OPR/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent) && !/Seamonkey/i.test(userAgent);
  const isEdge = /Edg/i.test(userAgent);

  return isChrome || isFirefox || isEdge;
}

/**
 * Gets detailed browser information including support status
 */
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent || navigator.vendor || "";

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  if (isInAppBrowser()) {
    let browserName = "In-App Browser";

    if (/FBAN|FBAV/i.test(userAgent)) {
      browserName = "Facebook";
    } else if (/Instagram/i.test(userAgent)) {
      browserName = "Instagram";
    } else if (/Gmail/i.test(userAgent)) {
      browserName = "Gmail";
    } else if (/LinkedIn/i.test(userAgent)) {
      browserName = "LinkedIn";
    } else if (/Twitter/i.test(userAgent)) {
      browserName = "Twitter/X";
    } else if (/WhatsApp/i.test(userAgent)) {
      browserName = "WhatsApp";
    } else if (/Snapchat/i.test(userAgent)) {
      browserName = "Snapchat";
    } else if (/Line\//i.test(userAgent)) {
      browserName = "LINE";
    } else if (/Telegram/i.test(userAgent)) {
      browserName = "Telegram";
    } else if (/WeChat|MicroMessenger/i.test(userAgent)) {
      browserName = "WeChat";
    } else if (/GoogleApp/i.test(userAgent)) {
      browserName = "Google App";
    } else if (/SamsungBrowser/i.test(userAgent)) {
      browserName = "Samsung Internet";
    }

    return {
      isSupported: false,
      browserName,
      browserType: "in-app",
      recommendedAction: "openInDefaultBrowser",
    };
  }

  if (isDuckDuckGo()) {
    return {
      isSupported: false,
      browserName: "DuckDuckGo",
      browserType: "privacy-focused",
      recommendedAction: "useChromeOrFirefox",
    };
  }

  if (isPrivacyFocusedBrowser()) {
    let browserName = "Privacy Browser";

    if (/Brave/i.test(userAgent)) {
      browserName = "Brave";
    } else if (/Firefox Focus/i.test(userAgent)) {
      browserName = "Firefox Focus";
    } else if (/Tor Browser/i.test(userAgent)) {
      browserName = "Tor Browser";
    }

    return {
      isSupported: false,
      browserName,
      browserType: "privacy-focused",
      recommendedAction: "useChromeOrFirefox",
    };
  }

  if (isIOS) {
    if (/CriOS/i.test(userAgent)) {
      return {
        isSupported: false,
        browserName: "Chrome (iOS)",
        browserType: "standard",
        recommendedAction: "useSafariOnIOS",
      };
    }

    if (/FxiOS/i.test(userAgent)) {
      return {
        isSupported: false,
        browserName: "Firefox (iOS)",
        browserType: "standard",
        recommendedAction: "useSafariOnIOS",
      };
    }

    if (/EdgiOS/i.test(userAgent)) {
      return {
        isSupported: false,
        browserName: "Edge (iOS)",
        browserType: "standard",
        recommendedAction: "useSafariOnIOS",
      };
    }

    if (/Safari/i.test(userAgent)) {
      return {
        isSupported: true,
        browserName: "Safari",
        browserType: "standard",
      };
    }

    return {
      isSupported: false,
      browserName: "Unknown iOS Browser",
      browserType: "unknown",
      recommendedAction: "useSafariOnIOS",
    };
  }

  if (
    /Chrome/i.test(userAgent) &&
    !/Edge|Edg/i.test(userAgent) &&
    !/OPR/i.test(userAgent)
  ) {
    return {
      isSupported: true,
      browserName: "Chrome",
      browserType: "standard",
    };
  }

  if (
    /Safari/i.test(userAgent) &&
    !/Chrome/i.test(userAgent) &&
    !/CriOS/i.test(userAgent)
  ) {
    return {
      isSupported: true,
      browserName: "Safari",
      browserType: "standard",
    };
  }

  if (/Firefox/i.test(userAgent) && !/Seamonkey/i.test(userAgent)) {
    return {
      isSupported: true,
      browserName: "Firefox",
      browserType: "standard",
    };
  }

  if (/Edg/i.test(userAgent)) {
    return {
      isSupported: true,
      browserName: "Edge",
      browserType: "standard",
    };
  }

  if (/OPR/i.test(userAgent) || /Opera/i.test(userAgent)) {
    return {
      isSupported: false,
      browserName: "Opera",
      browserType: "standard",
      recommendedAction: "useChromeOrFirefox",
    };
  }

  return {
    isSupported: false,
    browserName: "Unknown Browser",
    browserType: "unknown",
    recommendedAction: "useChromeOrFirefox",
  };
}

/**
 * Gets recommended browsers for the current platform
 */
export function getRecommendedBrowsers(os: string): string[] {
  switch (os) {
    case "iOS":
      return ["Safari"];
    case "Android":
      return ["Chrome", "Firefox"];
    case "MacOS":
      return ["Safari", "Chrome", "Firefox", "Edge"];
    case "Windows":
    case "Linux":
      return ["Chrome", "Firefox", "Edge"];
    default:
      return ["Chrome", "Firefox", "Edge"];
  }
}

/**
 * Gets download links for supported browsers based on platform
 */
export function getBrowserDownloadLinks(
  os: string,
): Array<{ name: string; url: string }> {
  switch (os) {
    case "iOS":
      return [
        {
          name: "Safari",
          url: "https://apps.apple.com/us/app/safari/id1146562112",
        },
      ];
    case "Android":
      return [
        {
          name: "Chrome",
          url: "https://play.google.com/store/apps/details?id=com.android.chrome",
        },
        {
          name: "Firefox",
          url: "https://play.google.com/store/apps/details?id=org.mozilla.firefox",
        },
      ];
    case "MacOS":
      return [
        { name: "Safari", url: "https://www.apple.com/safari/" },
        { name: "Chrome", url: "https://www.google.com/chrome/" },
        { name: "Firefox", url: "https://www.firefox.com/" },
        { name: "Edge", url: "https://www.microsoft.com/edge" },
      ];
    case "Windows":
    case "Linux":
      return [
        { name: "Chrome", url: "https://www.google.com/chrome/" },
        { name: "Firefox", url: "https://www.firefox.com/" },
        { name: "Edge", url: "https://www.microsoft.com/edge" },
      ];
    default:
      return [
        { name: "Chrome", url: "https://www.google.com/chrome/" },
        { name: "Firefox", url: "https://www.firefox.com/" },
        { name: "Edge", url: "https://www.microsoft.com/edge" },
      ];
  }
}

/**
 * Gets instructions for opening current URL in a supported browser (mobile-specific)
 */
export function getOpenInBrowserInstructions(os: string): string[] {
  if (os === "iOS") {
    return ["iOS.copyUrl", "iOS.openSafari", "iOS.pasteUrl"];
  }

  if (os === "Android") {
    return [
      "Android.tapMenu",
      "Android.selectOpenBrowser",
      "Android.chooseChrome",
    ];
  }

  return ["generic"];
}
