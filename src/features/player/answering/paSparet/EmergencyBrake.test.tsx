import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmergencyBrake } from "./EmergencyBrake";

const handle = () => screen.getByRole("slider", { name: "Nödbroms, dra ned för att svara" });

// Drags the handle down by the given px and lets go.
function drag(by: number, { release = true } = {}) {
  fireEvent.pointerDown(handle(), { clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(handle(), { clientY: 100 + by, pointerId: 1 });
  if (release) fireEvent.pointerUp(handle(), { pointerId: 1 });
}

describe("EmergencyBrake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("asks to be dragged to the line, and offers the points once there", () => {
    render(<EmergencyBrake points={8} disabled={false} onPull={vi.fn()} />);
    expect(screen.getByText("Dra hit")).toBeInTheDocument();
    drag(145, { release: false });
    expect(screen.getByText("Släpp för att svara på 8 p")).toBeInTheDocument();
    expect(handle()).toHaveAttribute("aria-valuenow", "97");
  });

  it("is pulled when let go past the line, and stays down", () => {
    const onPull = vi.fn(() => true);
    render(<EmergencyBrake points={8} disabled={false} onPull={onPull} />);
    drag(145);
    expect(onPull).toHaveBeenCalledOnce();
    expect(handle()).toHaveAttribute("aria-valuenow", "100");
  });

  it("springs back when let go too early, or when the pull isn't taken", () => {
    const onPull = vi.fn(() => false);
    render(<EmergencyBrake points={8} disabled={false} onPull={onPull} />);
    drag(60);
    expect(onPull).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
    drag(145);
    expect(onPull).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(1000));
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("stays down while the pull is sent, and springs back if sending fails", () => {
    const { rerender } = render(<EmergencyBrake points={8} disabled={false} onPull={() => true} />);
    drag(145);
    rerender(<EmergencyBrake points={8} disabled onPull={() => true} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(handle()).toHaveAttribute("aria-valuenow", "100");
    rerender(<EmergencyBrake points={8} disabled={false} onPull={() => true} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("follows only the finger that took hold of it", () => {
    const onPull = vi.fn(() => true);
    render(<EmergencyBrake points={8} disabled={false} onPull={onPull} />);
    fireEvent.pointerDown(handle(), { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle(), { clientY: 300, pointerId: 2 });
    fireEvent.pointerUp(handle(), { pointerId: 2 });
    expect(onPull).not.toHaveBeenCalled();
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("can be pulled with Enter", () => {
    const onPull = vi.fn(() => true);
    render(<EmergencyBrake points={8} disabled={false} onPull={onPull} />);
    fireEvent.keyDown(handle(), { key: "Enter" });
    fireEvent.keyDown(handle(), { key: "Enter", repeat: true });
    fireEvent.keyDown(handle(), { key: "a" });
    expect(onPull).toHaveBeenCalledOnce();
  });

  it("can't be pulled while disabled", () => {
    const onPull = vi.fn(() => true);
    render(<EmergencyBrake points={8} disabled onPull={onPull} />);
    drag(145);
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(onPull).not.toHaveBeenCalled();
  });
});
