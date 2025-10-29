export function getOperatingSystem() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  let os = null;

  if (/Mac/i.test(platform)) {
    os = "MacOS";
  } else if (/Win/i.test(platform)) {
    os = "Windows";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  } else {
    os = "Android"; // Default to Android
  }

  return os;
}
