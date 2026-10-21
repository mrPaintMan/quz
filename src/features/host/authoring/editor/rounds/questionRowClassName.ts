// The frame around one row of a round's question list; the selected question stands out.
export function questionRowClassName(selected: boolean): string {
  return `flex items-start gap-1 rounded-xl border p-1 ${selected ? "border-primary bg-secondary" : "bg-card"}`;
}
