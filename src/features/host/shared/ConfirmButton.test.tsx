import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmButton } from "./ConfirmButton";

function renderConfirm(onConfirm = vi.fn()) {
  render(
    <ConfirmButton title="Ta bort quizet?" description="Det går inte att ångra." confirmLabel="Ta bort" onConfirm={onConfirm}>
      Ta bort quiz
    </ConfirmButton>,
  );
  return onConfirm;
}

describe("ConfirmButton", () => {
  it("does nothing until the host confirms", async () => {
    const onConfirm = renderConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort quiz" }));
    expect(await screen.findByText("Det går inte att ångra.")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("can be cancelled", async () => {
    const onConfirm = renderConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort quiz" }));
    await userEvent.click(await screen.findByRole("button", { name: "Avbryt" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
