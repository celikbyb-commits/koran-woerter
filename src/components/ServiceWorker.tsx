"use client";

import { useEffect } from "react";

/** Registriert den Service Worker (Offline-Nutzung, Installation als App). */
export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
