import { describe, expect, it } from "vitest";
import { moved } from "@/lib/reorder";
import { cn, formatDate, formatMinutes } from "@/lib/utils";

describe("cn", () => {
  it("joins classes, drops falsy values and lets later Tailwind classes win", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatMinutes", () => {
  it.each([
    [5, "5m"],
    [60, "1h"],
    [77, "1h 17m"],
    [0, "0m"],
  ])("%i minutes -> %s", (input, expected) => expect(formatMinutes(input)).toBe(expected));
});

describe("formatDate", () => {
  it("formats an ISO date for display", () => expect(formatDate("2026-10-22T12:00:00Z")).toMatch(/Oct 22, 2026/));
});

describe("moved (drag and drop ordering)", () => {
  const ids = ["a", "b", "c", "d"];

  it("moves an item before another", () => {
    expect(moved(ids, "d", "b")).toEqual(["a", "d", "b", "c"]);
    expect(moved(ids, "a", "c")).toEqual(["b", "a", "c", "d"]);
  });

  it("appends when no target is given or the target is unknown", () => {
    expect(moved(ids, "a")).toEqual(["b", "c", "d", "a"]);
    expect(moved(ids, "b", "zzz")).toEqual(["a", "c", "d", "b"]);
  });

  it("adds an item that came from another list", () => {
    expect(moved(["a", "b"], "x", "b")).toEqual(["a", "x", "b"]);
  });

  it("never duplicates or loses items, and does not mutate the input", () => {
    const copy = [...ids];
    const result = moved(ids, "c", "a");
    expect([...result].sort()).toEqual([...ids].sort());
    expect(ids).toEqual(copy);
  });

  it("dropping an item on itself keeps the order", () => {
    expect(moved(ids, "b", "b")).toEqual(ids);
  });
});
