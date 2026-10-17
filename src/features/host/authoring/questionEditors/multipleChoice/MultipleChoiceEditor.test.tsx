import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import type { Id } from "@convex/_generated/dataModel";
import { MultipleChoiceEditor } from "./MultipleChoiceEditor";

vi.mock("@/features/host/authoring/media/useUploadFile", () => ({ useUploadFile: () => async () => "file1" }));
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => "https://file.example" }));

const content: ContentOf<"multipleChoice"> = {
  type: "multipleChoice",
  options: [
    { text: "Sverige", imageId: null },
    { text: "Tyskland", imageId: null },
    { text: "Italien", imageId: null },
  ],
  correctIndex: 2,
  points: 2,
};

describe("MultipleChoiceEditor", () => {
  it("marks the correct option", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Alternativ A är rätt"));
    expect(onChange).toHaveBeenCalledWith({ ...content, correctIndex: 0 });
  });

  it("edits an option's text", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Alternativ B"), "!");
    expect(onChange.mock.lastCall?.[0].options[1].text).toBe("Tyskland!");
  });

  it("keeps the correct option marked when an earlier option is removed", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort alternativ A" }));
    expect(onChange).toHaveBeenCalledWith({ ...content, options: content.options.slice(1), correctIndex: 1 });
  });

  it("clears the correct option when it is removed itself", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort alternativ C" }));
    expect(onChange.mock.lastCall?.[0].correctIndex).toBeNull();
  });

  it("keeps the correct option when a later option is removed", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={{ ...content, correctIndex: 0 }} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort alternativ B" }));
    expect(onChange.mock.lastCall?.[0].correctIndex).toBe(0);
  });

  it("adds options up to six", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till alternativ" }));
    expect(onChange.mock.lastCall?.[0].options).toHaveLength(4);
    const six = { ...content, options: Array.from({ length: 6 }, () => ({ text: "x", imageId: null })) };
    rerender(<MultipleChoiceEditor content={six} onChange={onChange} />);
    expect(screen.queryByRole("button", { name: "Lägg till alternativ" })).not.toBeInTheDocument();
  });

  it("adds and removes an option image", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    const input = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "a.png", { type: "image/png" })] } });
    await vi.waitFor(() => expect(onChange.mock.lastCall?.[0].options[0].imageId).toBe("file1"));

    const withImage = { ...content, options: [{ text: "", imageId: "file1" as Id<"_storage"> }, ...content.options.slice(1)] };
    rerender(<MultipleChoiceEditor content={withImage} onChange={onChange} />);
    expect(screen.getByRole("img", { name: "Bild för alternativ A" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort bild" }));
    expect(onChange.mock.lastCall?.[0].options[0].imageId).toBeNull();
  });

  it("edits the points", async () => {
    const onChange = vi.fn();
    render(<MultipleChoiceEditor content={content} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Poäng"));
    await userEvent.type(screen.getByLabelText("Poäng"), "3");
    expect(onChange.mock.lastCall?.[0].points).toBe(3);
  });
});
