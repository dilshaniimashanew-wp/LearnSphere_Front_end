import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const unauthenticated = () => json(401, { error: { code: "UNAUTHENTICATED", message: "Not signed in", details: [] } });
const fetchMock = vi.fn<typeof fetch>();

function WhoAmI() {
  const { user, loading } = useAuth();
  return <p>{loading ? "checking" : user ? `signed in as ${user.name}` : "signed out"}</p>;
}

function Catalog() {
  const q = useQuery({ queryKey: ["api", "/courses"], queryFn: () => api<string>("/courses") });
  return <p>{q.isLoading ? "loading catalog" : `catalog: ${q.data}`}</p>;
}

beforeEach(() => {
  queryClient.clear();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AuthProvider", () => {
  it("shows a signed-in user returned by /auth/me", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { id: "1", name: "Ada", role: "student" } }));
    render(
      <AuthProvider>
        <WhoAmI />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed in as Ada")).toBeInTheDocument();
  });

  it("treats an unreachable or unauthenticated API as signed out", async () => {
    fetchMock.mockResolvedValue(unauthenticated());
    render(
      <AuthProvider>
        <WhoAmI />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();
  });

  it("does not discard a signed-out visitor's in-flight page data when the session check fails", async () => {
    // /auth/me and the refresh both fail quickly, while the catalog response is still on its way.
    let releaseCatalog: (r: Response) => void = () => undefined;
    fetchMock.mockImplementation((url) => {
      const path = String(url);
      if (path.endsWith("/courses")) return new Promise<Response>((resolve) => (releaseCatalog = resolve));
      return Promise.resolve(unauthenticated());
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WhoAmI />
          <Catalog />
        </AuthProvider>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(screen.getByText("loading catalog")).toBeInTheDocument();

    await act(async () => releaseCatalog(json(200, { data: "3 courses" })));
    await waitFor(() => expect(screen.getByText("catalog: 3 courses")).toBeInTheDocument());
  });

  it("clears cached data and signs out when a signed-in session can no longer be refreshed", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { id: "1", name: "Ada", role: "student" } }));
    render(
      <AuthProvider>
        <WhoAmI />
      </AuthProvider>,
    );
    await screen.findByText("signed in as Ada");

    queryClient.setQueryData(["api", "/enrollments/me"], ["private data"]);
    await act(async () => void window.dispatchEvent(new Event("auth:expired")));

    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(queryClient.getQueryData(["api", "/enrollments/me"])).toBeUndefined();
  });
});
