// How the question on the TV scores, such as Gissa siffran's levels, for the hosts to explain to
// the room; its first line names the kind of scoring.
export function ScoringRules({ lines }: { lines: string[] }) {
  const [kind, ...rules] = lines;
  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <h3 className="font-semibold">Poängsättning: {kind}</h3>
      <ul className="flex flex-col text-sm">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}
