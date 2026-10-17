import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HostSessionProvider, useHostSession } from "./HostSession";

function ShowPassphrase() {
  return <p>{useHostSession().passphrase}</p>;
}

describe("HostSession", () => {
  it("gives components inside the provider the host session", () => {
    render(
      <HostSessionProvider session={{ passphrase: "pepparkaka", logOut: vi.fn() }}>
        <ShowPassphrase />
      </HostSessionProvider>,
    );
    expect(screen.getByText("pepparkaka")).toBeInTheDocument();
  });

  it("fails loudly when used outside the gate", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useHostSession())).toThrow("inside HostGate");
  });
});
