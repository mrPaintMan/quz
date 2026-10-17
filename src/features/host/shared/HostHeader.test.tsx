import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HostHeader } from "./HostHeader";
import { HostSessionProvider } from "./HostSessionProvider";

describe("HostHeader", () => {
  it("shows its content and actions and logs the host out", async () => {
    const logOut = vi.fn();
    render(
      <HostSessionProvider session={{ passphrase: "p", logOut }}>
        <HostHeader actions={<button type="button">Spara</button>}>Julquiz 2026</HostHeader>
      </HostSessionProvider>,
    );
    expect(screen.getByText("Julquiz 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spara" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Logga ut" }));
    expect(logOut).toHaveBeenCalledOnce();
  });
});
