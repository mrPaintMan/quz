import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileButton } from "./FileButton";

function chooseFile(container: HTMLElement, file?: File) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: file ? [file] : [] } });
}

describe("FileButton", () => {
  it("hands the chosen file on", async () => {
    const onFile = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<FileButton accept="image/*" onFile={onFile}>Lägg till bild</FileButton>);
    const file = new File(["x"], "tomte.png", { type: "image/png" });
    chooseFile(container, file);
    expect(onFile).toHaveBeenCalledWith(file);
    expect(await screen.findByRole("button", { name: "Lägg till bild" })).toBeEnabled();
  });

  it("ignores a cancelled picker", () => {
    const onFile = vi.fn();
    const { container } = render(<FileButton accept="image/*" onFile={onFile}>Lägg till bild</FileButton>);
    chooseFile(container);
    expect(onFile).not.toHaveBeenCalled();
  });

  it("says when the upload failed", async () => {
    const { container } = render(
      <FileButton accept="image/*" onFile={vi.fn().mockRejectedValue(new Error("nope"))}>
        Lägg till bild
      </FileButton>,
    );
    chooseFile(container, new File(["x"], "tomte.png"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Uppladdningen misslyckades");
  });

  it("opens the file picker from the button", () => {
    const { container } = render(<FileButton accept="image/*" onFile={vi.fn()}>Lägg till bild</FileButton>);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    fireEvent.click(screen.getByRole("button", { name: "Lägg till bild" }));
    expect(click).toHaveBeenCalled();
  });
});
