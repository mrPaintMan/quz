import { formatDecimal } from "./formatDecimal";

// A number as Gissa siffran shows it to read: the whole part in groups of three ("4 500 000",
// with a narrow no-break space so it never wraps), the decimals after a comma ("3,25") (D67).
export function formatNumber(value: number): string {
  const [whole, decimals] = formatDecimal(value).split(",");
  const sign = whole.startsWith("-") ? "-" : "";
  const digits = sign ? whole.slice(1) : whole;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped}${decimals === undefined ? "" : `,${decimals}`}`;
}
