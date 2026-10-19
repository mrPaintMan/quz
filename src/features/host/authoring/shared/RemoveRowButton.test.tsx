import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RemoveRowButton } from "./RemoveRowButton";

describe("RemoveRowButton", () => {
  it("removes the row it names", async () => {
    const onRemove = vi.fn();
    render(<RemoveRowButton name="par 2" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort par 2" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
