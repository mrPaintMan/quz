import { act, fireEvent, screen } from "@testing-library/react";

const ROW_HEIGHT = 40;
const PAGE_HEIGHT = 1000;

const rect = (top: number, height: number): DOMRect => ({ x: 0, y: top, top, left: 0, right: 300, bottom: top + height, width: 300, height, toJSON: () => ({}) });

// jsdom lays nothing out, so every element measures 0 × 0 and dnd-kit can't tell rows apart.
// This stacks each list row ROW_HEIGHT tall, the way the browser draws them, inside a page
// tall enough that dnd-kit never scrolls instead of moving the row.
function stackRows(): () => void {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const row = this.closest("li");
    if (!row?.parentElement) return rect(0, PAGE_HEIGHT);
    return rect(Array.from(row.parentElement.children).indexOf(row) * ROW_HEIGHT, ROW_HEIGHT);
  };
  return () => {
    Element.prototype.getBoundingClientRect = original;
  };
}

// Drags a row one place up or down the way a keyboard user does: Space on its grip handle,
// an arrow key, Space to drop.
export async function dragByKeyboard(handleName: string, direction: "up" | "down") {
  const restore = stackRows();
  try {
    const handle = screen.getByRole("button", { name: handleName });
    handle.focus();
    for (const code of ["Space", direction === "down" ? "ArrowDown" : "ArrowUp", "Space"]) {
      fireEvent.keyDown(handle, { code });
      // dnd-kit measures the rows in the next animation frame.
      await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    }
  } finally {
    restore();
  }
}
