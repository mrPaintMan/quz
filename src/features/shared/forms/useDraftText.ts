"use client";

import { useState } from "react";

// The text in a field whose value is parsed from it, such as a number or one item per line.
// Typed text is kept while it means the same as the value, so "0," can be typed on the way
// to "0,5"; a change from outside (for example a removed row above) replaces it.
export function useDraftText<T>(
  value: T,
  format: (value: T) => string,
  parse: (text: string) => T,
): [string, (text: string) => void] {
  const formatted = format(value);
  const [text, setText] = useState(formatted);
  const [shownValue, setShownValue] = useState(formatted);
  // React's pattern for adjusting state when a prop changes: done during render, no effect.
  if (formatted !== shownValue) {
    setShownValue(formatted);
    if (format(parse(text)) !== formatted) setText(formatted);
  }
  return [text, setText];
}
