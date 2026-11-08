// Optional GA4 event tracking. Nothing is transmitted unless you provide a measurement ID.
export function trackEvent(name, properties = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, properties);
  }
}
