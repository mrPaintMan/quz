import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { MultipleChoiceAnswer, MultipleChoiceQuestion } from "./MultipleChoiceDisplay";

const picture = "img1" as Id<"_storage">;
const options = [
  { text: "Sverige", imageId: null },
  { text: "Norge", imageId: picture },
];
const imageUrls = { [picture]: "https://example.com/norge.jpg" };

describe("MultipleChoiceQuestion", () => {
  it("shows each option with its letter, text and picture", () => {
    render(<MultipleChoiceQuestion shown={{ type: "multipleChoice", options }} imageUrls={imageUrls} />);
    const [first, second] = screen.getAllByRole("listitem");
    expect(first).toHaveTextContent("ASverige");
    expect(second).toHaveTextContent("BNorge");
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://example.com/norge.jpg");
  });
});

describe("MultipleChoiceAnswer", () => {
  it("lights up the right option and dims the others", () => {
    render(<MultipleChoiceAnswer revealed={{ type: "multipleChoice", options, correctIndex: 1 }} imageUrls={imageUrls} />);
    const [wrong, right] = screen.getAllByRole("listitem");
    expect(right).toHaveClass("border-primary");
    expect(wrong).toHaveClass("opacity-40");
  });

  it("shows all options plainly when no right option is set", () => {
    render(<MultipleChoiceAnswer revealed={{ type: "multipleChoice", options, correctIndex: null }} imageUrls={imageUrls} />);
    for (const option of screen.getAllByRole("listitem")) expect(option).not.toHaveClass("opacity-40");
  });
});
