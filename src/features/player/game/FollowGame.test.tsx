import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { FollowGame } from "./FollowGame";

vi.mock("@/features/player/answering/AnswerQuestion", () => ({
  AnswerQuestion: ({ isTimeOut }: { isTimeOut: boolean }) => <p>{isTimeOut ? "Svarsruta, tiden ute" : "Svarsruta"}</p>,
}));

const team = { _id: "t1" as Id<"teams">, name: "Tomtarna", colour: "red" as const };
const questionScreen = { kind: "question" as const, questionId: "q1" as Id<"questions"> };
const question = { kind: "question" as const, roundNumber: 1, questionNumber: 1, prompt: "Vilket land?", answeredInApp: true, shown: null };
const shown = { type: "multipleChoice" as const, options: [{ text: "Sverige", imageId: null }] };

describe("FollowGame", () => {
  it("shows the team and what is going on", () => {
    render(<FollowGame team={team} points={null} screen={{ kind: "lobby" }} view={{ kind: "lobby" }} imageUrls={{}} timer={null} isQuestionClosed={false} />);
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ni är med! Vi börjar snart.");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows the question's timer", () => {
    render(<FollowGame team={team} points={null} screen={questionScreen} view={question} imageUrls={{}} timer={{ kind: "paused", remainingMs: 42_000 }} isQuestionClosed={false} />);
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
  });

  it("points at the TV for a question its type can't be answered in the app yet", () => {
    render(<FollowGame team={team} points={null} screen={questionScreen} view={question} imageUrls={{}} timer={null} isQuestionClosed={false} />);
    expect(screen.queryByText("Svarsruta")).not.toBeInTheDocument();
  });

  it("lets the team answer a question answered in the app", () => {
    render(<FollowGame team={team} points={null} screen={questionScreen} view={{ ...question, shown }} imageUrls={{}} timer={null} isQuestionClosed={false} />);
    expect(screen.getByText("Svarsruta")).toBeInTheDocument();
  });

  it("tells the answer when the time is out", () => {
    const timer = { kind: "paused" as const, remainingMs: 0 };
    render(<FollowGame team={team} points={null} screen={questionScreen} view={{ ...question, shown }} imageUrls={{}} timer={timer} isQuestionClosed={false} />);
    expect(screen.getByText("Svarsruta, tiden ute")).toBeInTheDocument();
  });

  it("takes no answer for a question the hosts have stepped on from", () => {
    render(<FollowGame team={team} points={null} screen={questionScreen} view={{ ...question, shown }} imageUrls={{}} timer={null} isQuestionClosed />);
    expect(screen.queryByText("Svarsruta")).not.toBeInTheDocument();
  });

  it("shows the team's own score", () => {
    render(<FollowGame team={team} points={12} screen={{ kind: "lobby" }} view={{ kind: "lobby" }} imageUrls={{}} timer={null} isQuestionClosed={false} />);
    expect(screen.getByText("12 p")).toBeInTheDocument();
  });
});
