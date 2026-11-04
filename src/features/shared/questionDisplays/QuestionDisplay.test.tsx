import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RevealedAnswerDisplay, ShownQuestionDisplay } from "./QuestionDisplay";

const options = [{ text: "Sverige", imageId: null }];

describe("ShownQuestionDisplay and RevealedAnswerDisplay", () => {
  it("draw the question and its answer with the type's own display", () => {
    render(
      <>
        <ShownQuestionDisplay shown={{ type: "multipleChoice", options }} imageUrls={{}} />
        <RevealedAnswerDisplay revealed={{ type: "multipleChoice", options, correctIndex: 0 }} imageUrls={{}} />
      </>,
    );
    expect(screen.getAllByText("Sverige")).toHaveLength(2);
  });
});
