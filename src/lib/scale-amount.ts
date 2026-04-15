/* ──────────────────────────────────────────────
 * Scale ingredient amounts based on portion changes.
 * Shared between Rezeptdetail and Kochmodus.
 * ──────────────────────────────────────────────*/

/** Format a number for display: integers stay integers, decimals get comma */
export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  // Show max 2 decimal places, strip trailing zeros
  return parseFloat(n.toFixed(2)).toString().replace(".", ",");
}

/** Scale an ingredient amount string from originalServings to currentServings */
export function scaleAmount(
  amount: string | null,
  originalServings: number,
  currentServings: number,
): string {
  if (!amount || originalServings === 0) return amount || "";
  if (originalServings === currentServings) return amount;

  // Try to extract a leading number (handles "250", "1.5", "½", "1/2" etc.)
  const match = amount.match(
    /^(\d+[.,]?\d*)\s*(.*)/,
  );

  if (!match) {
    // Try unicode fractions
    const fractionMap: Record<string, number> = {
      "½": 0.5,
      "⅓": 1 / 3,
      "⅔": 2 / 3,
      "¼": 0.25,
      "¾": 0.75,
      "⅕": 0.2,
      "⅛": 0.125,
    };
    const firstChar = amount.charAt(0);
    if (fractionMap[firstChar]) {
      const scaled =
        (fractionMap[firstChar] / originalServings) * currentServings;
      const rest = amount.slice(1).trim();
      return `${formatNumber(scaled)}${rest ? " " + rest : ""}`;
    }
    return amount;
  }

  const num = parseFloat(match[1].replace(",", "."));
  const unit = match[2];
  const scaled = (num / originalServings) * currentServings;

  return `${formatNumber(scaled)}${unit ? " " + unit : ""}`;
}
