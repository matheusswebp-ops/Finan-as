/**
 * Timezone helpers for Brazil (America/Sao_Paulo).
 * Vercel servers run in UTC; using new Date() directly gives the wrong "today"
 * for users in Brazil (UTC-3). All server-side "today" comparisons use these.
 */

/** Today's date as "yyyy-MM-dd" in Brazil's local timezone. */
export function brazilToday(): string {
  return new Intl.DateTimeFormat("sv", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

/** Current hour (0-23) in Brazil's local timezone. */
export function brazilHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
}
