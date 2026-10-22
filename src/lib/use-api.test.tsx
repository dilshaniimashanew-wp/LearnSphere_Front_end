import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/lib/api";
import { errorMessage, useApi } from "@/lib/use-api";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const fetchMock = vi.fn<typeof fetch>();

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("useApi", () => {
  it("loads data and reports the loading state", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { name: "Ada" } }));
    const { result } = renderHook(() => useApi<{ name: string }>("/users/me"), { wrapper });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ name: "Ada" });
    expect(result.current.error).toBeNull();
  });

  it("exposes a readable error", async () => {
    fetchMock.mockResolvedValueOnce(json(404, { error: { code: "NOT_FOUND", message: "Course not found", details: [] } }));
    const { result } = renderHook(() => useApi("/courses/x"), { wrapper });
    await waitFor(() => expect(result.current.error).toBe("Course not found"));
    expect(result.current.data).toBeNull();
  });

  it("does nothing when the path is null", () => {
    const { result } = renderHook(() => useApi(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refetches on reload()", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: 1 })).mockResolvedValueOnce(json(200, { data: 2 }));
    const { result } = renderHook(() => useApi<number>("/counter"), { wrapper });
    await waitFor(() => expect(result.current.data).toBe(1));
    result.current.reload();
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});

describe("errorMessage", () => {
  it("includes the first validation detail for 400 responses", () => {
    const e = new ApiRequestError(400, {
      code: "VALIDATION_ERROR",
      message: "Please check the submitted fields",
      details: [{ message: "Use at least 8 characters" }],
    });
    expect(errorMessage(e)).toBe("Please check the submitted fields: Use at least 8 characters");
  });

  it("uses the API message for other statuses and a fallback for unknown errors", () => {
    expect(errorMessage(new ApiRequestError(409, { code: "CONFLICT", message: "Already enrolled" }))).toBe("Already enrolled");
    expect(errorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
    expect(errorMessage(null, "custom")).toBe("custom");
  });
});
