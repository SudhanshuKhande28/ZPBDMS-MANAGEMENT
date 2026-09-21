import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Returns true if running inside a native mobile container (Capacitor Android / iOS)
 */
export const isNativePlatform = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
};

/**
 * Returns true specifically on Android
 */
export const isAndroid = () => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch (e) {
    return false;
  }
};

/**
 * Detects if client is running on Apple iPhone, iPad, or iPod
 */
export const isIOS = () => {
  if (typeof window === "undefined") return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

/**
 * Detects if running as installed standalone Web App on iOS
 */
export const isStandaloneIOS = () => {
  if (typeof window === "undefined") return false;
  return window.navigator.standalone === true;
};

/**
 * Configure native mobile Android status bar to blend seamlessly with theme
 */
export const setupStatusBar = async (isLight = false) => {
  if (!isNativePlatform()) return;
  try {
    await StatusBar.setBackgroundColor({
      color: isLight ? "#f1f5f9" : "#08090d",
    });
    await StatusBar.setStyle({
      style: isLight ? Style.Light : Style.Dark,
    });
  } catch (err) {
    console.debug("StatusBar configuration bypassed:", err);
  }
};

/**
 * Register Android hardware back-button listener
 * Handles hierarchical dismissal: Modals -> Drawers -> Sub-tabs -> Exit
 */
export const registerBackButtonHandler = (callback) => {
  if (!isNativePlatform()) return () => {};
  let listenerHandle = null;
  try {
    CapApp.addListener("backButton", (eventData) => {
      if (typeof callback === "function") {
        callback(eventData);
      }
    }).then((handle) => {
      listenerHandle = handle;
    });
  } catch (err) {
    console.debug("BackButton handler registration bypassed:", err);
  }

  return () => {
    if (listenerHandle && typeof listenerHandle.remove === "function") {
      listenerHandle.remove();
    }
  };
};

/**
 * Native app exit trigger for Android
 */
export const exitNativeApp = () => {
  if (isNativePlatform()) {
    try {
      CapApp.exitApp();
    } catch (e) {
      console.warn("Could not exit app:", e);
    }
  }
};
