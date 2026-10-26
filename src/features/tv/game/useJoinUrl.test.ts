import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useJoinUrl } from "./useJoinUrl";

describe("useJoinUrl", () => {
  it("points at the start page of the address the TV runs on", () => {
    const { result } = renderHook(() => useJoinUrl());
    expect(result.current?.href).toBe(`${window.location.origin}/`);
  });
});
