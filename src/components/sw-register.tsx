"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability/offline support is a nice-to-have — a failed
        // registration shouldn't be user-visible or block anything.
      });
    }
  }, []);

  return null;
}
