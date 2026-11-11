// The hosts' notes for a question, kept as written, line breaks included. The next screen's notes
// are the script into it, so they stand out; the notes of the question on the TV fold away, to be
// opened when needed.
export function QuestionNotes({ notes, folded = false }: { notes: string; folded?: boolean }) {
  if (notes === "") return null;
  const text = <p className="whitespace-pre-wrap">{notes}</p>;
  if (folded) {
    return (
      <details className="rounded-xl border bg-card px-4 py-2 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Anteckningar för frågan på TV:n</summary>
        <div className="pt-2">{text}</div>
      </details>
    );
  }
  return (
    <section className="flex flex-col gap-1 rounded-xl border border-primary/50 bg-card p-4">
      <h3 className="text-sm font-semibold text-primary">Anteckningar</h3>
      {text}
    </section>
  );
}
