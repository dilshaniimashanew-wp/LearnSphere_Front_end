import { describe, expect, it } from "vitest";
import { forwardHeaders } from "@/lib/api-proxy";

describe("forwardHeaders", () => {
  it("passes the visitor's IP and the shared secret to the API", () => {
    const h = forwardHeaders(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }), "s3cret-s3cret-s3cret");
    expect(h.get("x-client-ip")).toBe("203.0.113.9");
    expect(h.get("x-proxy-secret")).toBe("s3cret-s3cret-s3cret");
  });

  it("falls back to x-real-ip", () => {
    expect(forwardHeaders(new Headers({ "x-real-ip": "198.51.100.7" }), "s3cret-s3cret-s3cret").get("x-client-ip")).toBe("198.51.100.7");
  });

  it("discards an IP or secret supplied by the visitor", () => {
    const h = forwardHeaders(
      new Headers({ "x-client-ip": "1.2.3.4", "x-proxy-secret": "guess", "x-forwarded-for": "203.0.113.9" }),
      "real-secret-real-secret",
    );
    expect(h.get("x-client-ip")).toBe("203.0.113.9");
    expect(h.get("x-proxy-secret")).toBe("real-secret-real-secret");
  });

  it("never forwards visitor-supplied values when no secret is configured", () => {
    const h = forwardHeaders(new Headers({ "x-client-ip": "1.2.3.4", "x-proxy-secret": "guess", "x-forwarded-for": "203.0.113.9" }));
    expect(h.get("x-client-ip")).toBeNull();
    expect(h.get("x-proxy-secret")).toBeNull();
  });

  it("keeps the other headers (cookies, origin) untouched", () => {
    const h = forwardHeaders(
      new Headers({ cookie: "ls_access=abc", origin: "https://app.example", "content-type": "application/json" }),
      "s3cret-s3cret-s3cret",
    );
    expect(h.get("cookie")).toBe("ls_access=abc");
    expect(h.get("origin")).toBe("https://app.example");
    expect(h.get("content-type")).toBe("application/json");
  });
});
