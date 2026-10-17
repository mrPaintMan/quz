import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionTypeSelect } from "./QuestionTypeSelect";

describe("QuestionTypeSelect", () => {
  it("changes type only after the host confirms", async () => {
    const onChange = vi.fn();
    render(<QuestionTypeSelect value="freeText" roundKind="questions" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("Frågetyp"), "Rita svar");
    expect(onChange).not.toHaveBeenCalled();
    expect(await screen.findByText("Byt till Rita svar?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Byt frågetyp" }));
    expect(onChange).toHaveBeenCalledWith("drawing");
  });

  it("keeps the type when the host cancels", async () => {
    const onChange = vi.fn();
    render(<QuestionTypeSelect value="freeText" roundKind="questions" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("Frågetyp"), "Rita svar");
    await userEvent.click(await screen.findByRole("button", { name: "Avbryt" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
