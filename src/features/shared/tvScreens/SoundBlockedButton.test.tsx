import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SoundBlockedButton } from "./SoundBlockedButton";

describe("SoundBlockedButton", () => {
  it("asks for the click the browser needs before it plays sound", async () => {
    const onClick = vi.fn();
    render(<SoundBlockedButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Klicka för att slå på ljudet" }));
    expect(onClick).toHaveBeenCalled();
  });
});
