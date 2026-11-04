import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { AnswerStatusList } from "./AnswerStatusList";

const red = { _id: "t1" as Id<"teams">, name: "Röda", colour: "red" as const };
const blue = { _id: "t2" as Id<"teams">, name: "Blå", colour: "blue" as const };

describe("AnswerStatusList", () => {
  it("shows which teams have answered and which the hosts wait for", () => {
    render(<AnswerStatusList teams={[red, blue]} answeredTeamIds={[red._id]} />);
    const [first, second] = screen.getAllByRole("listitem");
    expect(first).toHaveTextContent("RödaSvarat");
    expect(second).toHaveTextContent("BlåVäntar");
  });

  it("shows nothing before any team has joined", () => {
    const { container } = render(<AnswerStatusList teams={[]} answeredTeamIds={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
