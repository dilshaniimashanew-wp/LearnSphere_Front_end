/**
 * Headers for a request the web app forwards to the API.
 *
 * The browser only ever talks to this app's own domain (so the session cookies are first-party and work
 * on every browser). The API therefore sees all traffic coming from this app, so the real visitor IP is
 * passed along in `x-client-ip`, together with a shared secret that proves the header can be trusted.
 */
export function forwardHeaders(incoming: Headers, secret?: string) {
  const headers = new Headers(incoming);
  // Whatever a visitor sends for these is untrusted: drop it, then set it from the platform's own value.
  headers.delete("x-client-ip");
  headers.delete("x-proxy-secret");

  const visitorIp = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip");
  if (visitorIp && secret) {
    headers.set("x-client-ip", visitorIp);
    headers.set("x-proxy-secret", secret);
  }
  return headers;
}
