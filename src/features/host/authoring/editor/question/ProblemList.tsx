import type { Problem } from "@/domain/questionTypes/questionTypeRules";

// What is still missing before the quiz can start; shown, not blocking, while writing (D20).
export function ProblemList({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) {
    return (
      <p role="status" className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
        Frågan är klar.
      </p>
    );
  }
  return (
    <div role="status" className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
      <p className="font-medium text-primary">Kvar att fylla i:</p>
      <ul className="mt-1 list-disc pl-5">
        {problems.map((problem) => (
          <li key={problem.message}>{problem.message}</li>
        ))}
      </ul>
    </div>
  );
}
