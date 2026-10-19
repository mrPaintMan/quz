import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("sends the trimmed passphrase", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<LoginForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Lösenord"), " pepparkaka ");
    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));
    expect(onSubmit).toHaveBeenCalledWith("pepparkaka");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("says so when the passphrase is wrong", async () => {
    render(<LoginForm onSubmit={vi.fn().mockResolvedValue(false)} />);
    await userEvent.type(screen.getByLabelText("Lösenord"), "fel");
    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Fel lösenord");
  });

  it("treats a failed check as a wrong passphrase", async () => {
    render(<LoginForm onSubmit={vi.fn().mockRejectedValue(new Error("offline"))} />);
    await userEvent.type(screen.getByLabelText("Lösenord"), "pepparkaka");
    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Fel lösenord");
  });

  it("can't be sent empty", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Logga in" })).toBeDisabled();
  });

  it("shows the logo linking home", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Quz" })).toHaveAttribute("href", "/");
  });
});
