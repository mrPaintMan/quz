import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHostSession } from "@/features/host/shared/HostSessionProvider";
import { HostGate } from "./HostGate";

const useQuery = vi.fn();
const convexQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  useConvex: () => ({ query: convexQuery }),
}));

function Secret() {
  const { passphrase, logOut } = useHostSession();
  return (
    <button type="button" onClick={logOut}>
      Inne med {passphrase}
    </button>
  );
}

describe("HostGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useQuery.mockReset();
    convexQuery.mockReset();
  });

  it("asks for the passphrase when none is stored", () => {
    render(<HostGate><Secret /></HostGate>);
    expect(screen.getByLabelText("Lösenord")).toBeInTheDocument();
  });

  it("lets the host in after a passphrase the server accepts, and out again", async () => {
    convexQuery.mockResolvedValue(true);
    useQuery.mockReturnValue(true);
    render(<HostGate><Secret /></HostGate>);
    await userEvent.type(screen.getByLabelText("Lösenord"), "pepparkaka");
    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));
    await userEvent.click(await screen.findByRole("button", { name: "Inne med pepparkaka" }));
    expect(screen.getByLabelText("Lösenord")).toBeInTheDocument();
  });

  it("does not remember a rejected passphrase", async () => {
    convexQuery.mockResolvedValue(false);
    render(<HostGate><Secret /></HostGate>);
    await userEvent.type(screen.getByLabelText("Lösenord"), "fel");
    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(window.localStorage.getItem("quz.hostPassphrase")).toBeNull();
  });

  it("waits for the server before letting a stored passphrase in", () => {
    window.localStorage.setItem("quz.hostPassphrase", "pepparkaka");
    useQuery.mockReturnValue(undefined);
    render(<HostGate><Secret /></HostGate>);
    expect(screen.getByText("Kontrollerar inloggning…")).toBeInTheDocument();
  });

  it("forgets a stored passphrase the server no longer accepts", () => {
    window.localStorage.setItem("quz.hostPassphrase", "gammalt");
    useQuery.mockReturnValue(false);
    render(<HostGate><Secret /></HostGate>);
    expect(screen.getByLabelText("Lösenord")).toBeInTheDocument();
    expect(window.localStorage.getItem("quz.hostPassphrase")).toBeNull();
  });
});
