// A number as Gissa siffran shows it to read: the whole part in groups of three ("4 500 000"),
// decimals after a comma ("3,25"), also for numbers too big or small for plain digits (D67).
const format = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 20 });

export function formatNumber(value: number): string {
  return format.format(value);
}
