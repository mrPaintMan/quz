import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { ActionErrorProvider, useRunAction } from "./ActionErrorProvider";

function Trigger({ action }: { action: () => Promise<unknown> }) {
  const run = useRunAction();
  return (
    <button type="button" onClick={() => run(action)}>
      Gör något
    </button>
  );
}

describe("ActionErrorProvider", () => {
  it("shows why an action failed until dismissed", async () => {
    render(
      <ActionErrorProvider>
        <Trigger action={() => Promise.reject(new ConvexError("Hittades inte, den kan ha tagits bort."))} />
      </ActionErrorProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Gör något" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Hittades inte, den kan ha tagits bort.");
    await userEvent.click(screen.getByRole("button", { name: "Stäng" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("passes on the result of a successful action and shows nothing", async () => {
    const { result } = renderHook(() => useRunAction(), { wrapper: ActionErrorProvider });
    await expect(result.current(async () => "ok")).resolves.toBe("ok");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("swallows failures outside the provider", async () => {
    const { result } = renderHook(() => useRunAction());
    await expect(result.current(() => Promise.reject(new Error("x")))).resolves.toBeUndefined();
  });
});
