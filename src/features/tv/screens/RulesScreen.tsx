import { TvFrame } from "./TvFrame";

const RULES = [
  { title: "Svara i mobilen", text: "Frågan visas här på TV:n, svaret skickar ni från telefonen." },
  { title: "Domarna styr tempot", text: "Mobilen följer med av sig själv. Ni behöver aldrig trycka vidare." },
  { title: "Tomtefar och tomtemor dömer", text: "Deras ord är lag. Överklaganden tas emot i form av pepparkakor." },
];

type RulesScreenProps = { roundCount: number; questionCount: number; activityCount: number };

export function RulesScreen({ roundCount, questionCount, activityCount }: RulesScreenProps) {
  const overview = [
    { count: roundCount, label: roundCount === 1 ? "omgång" : "omgångar" },
    { count: questionCount, label: questionCount === 1 ? "fråga" : "frågor" },
    { count: activityCount, label: activityCount === 1 ? "aktivitet" : "aktiviteter" },
  ];
  return (
    <TvFrame title="Så funkar kvällen">
      <div className="flex flex-1 gap-[4cqw]">
        <ul className="flex flex-1 flex-col gap-[1.4cqw]">
          {RULES.map((rule) => (
            <li key={rule.title} className="rounded-[1.4cqw] border-2 bg-card px-[2.2cqw] py-[1.8cqw]">
              <p className="text-[2.4cqw] font-semibold">{rule.title}</p>
              <p className="mt-[0.4cqw] text-[1.6cqw] text-muted-foreground">{rule.text}</p>
            </li>
          ))}
        </ul>
        <section aria-label="Kvällens upplägg" className="grid w-[30cqw] shrink-0 content-start gap-[1.2cqw]">
          {overview.map(({ count, label }) => (
            <p key={label} className="rounded-[1.4cqw] bg-card p-[1.8cqw] text-[1.8cqw]">
              <span className="block text-[5cqw] leading-none font-bold text-primary">{count}</span>
              {label}
            </p>
          ))}
        </section>
      </div>
    </TvFrame>
  );
}
