// Marks a verdict the AI judge gave, so the hosts can tell it from their own (D52).
export function AiMark() {
  return (
    <span title="Bedömt av AI" className="ml-2 rounded bg-secondary px-1.5 py-0.5 align-middle text-xs font-normal text-muted-foreground">
      AI
    </span>
  );
}
