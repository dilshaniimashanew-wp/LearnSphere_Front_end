import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, api } from "@/lib/api";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const fetchMock = vi.fn<typeof fetch>();
const calls = () =>
  fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? "GET"} ${String(url).replace("http://localhost:4000/api/v1", "")}`);

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("api()", () => {
  it("sends cookies, unwraps { data } and returns the payload", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { id: 1 }, message: "ok" }));
    expect(await api("/things")).toEqual({ id: 1 });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("throws a typed error with the API's code and message", async () => {
    fetchMock.mockResolvedValueOnce(json(409, { error: { code: "CONFLICT", message: "Already enrolled", details: [] } }));
    const error = await api("/enroll", { method: "POST" }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 409, message: "Already enrolled", error: { code: "CONFLICT" } });
  });

  it("falls back to a generic error when the body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>bad gateway</html>", { status: 502 }));
    await expect(api("/x")).rejects.toMatchObject({ status: 502, message: "Something went wrong" });
  });
});

describe("silent session refresh", () => {
  it("refreshes once on a 401 and retries the original request", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { error: { code: "UNAUTHENTICATED", message: "expired", details: [] } }))
      .mockResolvedValueOnce(json(200, { data: {} })) // POST /auth/refresh
      .mockResolvedValueOnce(json(200, { data: { name: "Ada" } }));
    expect(await api("/users/me")).toEqual({ name: "Ada" });
    expect(calls()).toEqual(["GET /users/me", "POST /auth/refresh", "GET /users/me"]);
  });

  it("shares one refresh between simultaneous requests", async () => {
    let refreshes = 0;
    fetchMock.mockImplementation(async (url) => {
      const path = String(url);
      if (path.endsWith("/auth/refresh")) {
        refreshes += 1;
        return json(200, { data: {} });
      }
      // First call of each endpoint is unauthenticated, the retry succeeds.
      const first = !fetchMock.mock.calls.slice(0, -1).some(([u]) => String(u) === path);
      return first ? json(401, { error: { code: "UNAUTHENTICATED", message: "x", details: [] } }) : json(200, { data: path });
    });
    await Promise.all([api("/a"), api("/b"), api("/c")]);
    expect(refreshes).toBe(1);
  });

  it("tells the app the session ended when refreshing fails, and surfaces the 401", async () => {
    const expired = vi.fn();
    window.addEventListener("auth:expired", expired);
    fetchMock
      .mockResolvedValueOnce(json(401, { error: { code: "UNAUTHENTICATED", message: "expired", details: [] } }))
      .mockResolvedValueOnce(json(401, { error: { code: "UNAUTHENTICATED", message: "x", details: [] } }));
    await expect(api("/users/me")).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:expired", expired);
  });

  it.each(["/auth/login", "/auth/register", "/auth/refresh"])("never tries to refresh for %s", async (path) => {
    fetchMock.mockResolvedValueOnce(json(401, { error: { code: "UNAUTHENTICATED", message: "Invalid email or password", details: [] } }));
    await expect(api(path, { method: "POST" })).rejects.toMatchObject({ message: "Invalid email or password" });
    expect(calls()).toEqual([`POST ${path}`]);
  });

  it("does not refresh for other errors such as 403", async () => {
    fetchMock.mockResolvedValueOnce(json(403, { error: { code: "FORBIDDEN", message: "no", details: [] } }));
    await expect(api("/admin/users")).rejects.toMatchObject({ status: 403 });
    expect(calls()).toEqual(["GET /admin/users"]);
  });
});
