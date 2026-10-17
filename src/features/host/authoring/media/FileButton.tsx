"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type FileButtonProps = {
  accept: string;
  children: ReactNode;
  onFile: (file: File) => Promise<void>;
};

// A button that opens the file picker and reports the upload's progress and failure.
export function FileButton({ accept, children, onFile }: FileButtonProps) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "failed">("idle");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setState("uploading");
    try {
      await onFile(file);
      setState("idle");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <Button variant="outline" disabled={state === "uploading"} onClick={() => input.current?.click()}>
        {state === "uploading" ? "Laddar upp…" : children}
      </Button>
      {state === "failed" && (
        <p role="alert" className="text-sm text-destructive">
          Uppladdningen misslyckades. Försök igen.
        </p>
      )}
    </div>
  );
}
