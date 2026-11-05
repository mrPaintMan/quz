import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDraftText } from "./useDraftText";

const format = (value: number | null) => (value === null ? "" : String(value));
const parse = (text: string) => (text === "" ? null : Number(text));

describe("useDraftText", () => {
  it("starts from the formatted value", () => {
    const { result } = renderHook(() => useDraftText<number | null>(5, format, parse));
    expect(result.current[0]).toBe("5");
  });

  it("keeps typed text that means the same as the new value", () => {
    const { result, rerender } = renderHook(({ value }) => useDraftText(value, format, parse), { initialProps: { value: 5 as number | null } });
    act(() => result.current[1]("5.0"));
    rerender({ value: 5 });
    expect(result.current[0]).toBe("5.0");
  });

  it("replaces the text when the value changes from outside", () => {
    const { result, rerender } = renderHook(({ value }) => useDraftText(value, format, parse), { initialProps: { value: 5 as number | null } });
    act(() => result.current[1]("5.0"));
    rerender({ value: 7 });
    expect(result.current[0]).toBe("7");
  });
});
