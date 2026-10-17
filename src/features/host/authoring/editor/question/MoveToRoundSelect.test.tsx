import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { MoveToRoundSelect } from "./MoveToRoundSelect";

const round = (id: string, title: string, kind: "questions" | "paSparet") =>
  ({ _id: id as Id<"rounds">, title, kind }) as Doc<"rounds">;
const rounds = [round("r1", "Julmat", "questions"), round("r2", "Julfilmer", "questions"), round("r3", "På spåret", "paSparet")];

describe("MoveToRoundSelect", () => {
  it("offers only other rounds the question's type fits in, and moves there", async () => {
    const onMove = vi.fn();
    render(<MoveToRoundSelect currentRoundId={"r1" as Id<"rounds">} questionType="activity" rounds={rounds} onMove={onMove} />);
    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Välj rond…", "Julfilmer"]);
    await userEvent.selectOptions(screen.getByLabelText("Flytta till rond"), "Julfilmer");
    expect(onMove).toHaveBeenCalledWith("r2");
  });

  it("is hidden when no other round fits", () => {
    const { container } = render(
      <MoveToRoundSelect currentRoundId={"r3" as Id<"rounds">} questionType="paSparet" rounds={rounds} onMove={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
