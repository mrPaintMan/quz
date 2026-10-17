import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionErrorBoundary } from "./SessionErrorBoundary";

function Throws({ error }: { error: unknown }): never {
  throw error;
}

describe("SessionErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows its children when nothing fails", () => {
    render(<SessionErrorBoundary onWrongPassphrase={vi.fn()}>Innehåll</SessionErrorBoundary>);
    expect(screen.getByText("Innehåll")).toBeInTheDocument();
  });

  it("reports a passphrase the server no longer accepts", () => {
    const onWrongPassphrase = vi.fn();
    render(
      <SessionErrorBoundary onWrongPassphrase={onWrongPassphrase}>
        <Throws error={new ConvexError("Fel lösenord.")} />
      </SessionErrorBoundary>,
    );
    expect(onWrongPassphrase).toHaveBeenCalledOnce();
  });

  it("offers a reload for any other failure", async () => {
    const onWrongPassphrase = vi.fn();
    const reload = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, reload }, configurable: true });
    render(
      <SessionErrorBoundary onWrongPassphrase={onWrongPassphrase}>
        <Throws error={new Error("boom")} />
      </SessionErrorBoundary>,
    );
    expect(onWrongPassphrase).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Ladda om" }));
    expect(reload).toHaveBeenCalled();
  });
});
