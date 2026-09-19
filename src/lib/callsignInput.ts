/** Turning what an operator has into a list of callsigns
 *
 * Units name devices however they name them: OTTER1 to OTTER100 in one place, KORPPI and KIRVES
 * in another, and a spreadsheet somebody else produced in a third. All three are ordinary.
 */

/** PREFIX + n, for a unit that numbers its devices */
export function callsignsFromSeries(
  prefix: string,
  count: number,
  from: number,
): string[] {
  const clean = prefix.trim();
  if (!clean || count < 1) {
    return [];
  }
  return Array.from({ length: count }, (_, index) => `${clean}${from + index}`);
}

/** Names pasted or dropped in, however they are separated
 *
 * Newlines, commas, semicolons and tabs all appear in the wild, and a file exported from a
 * spreadsheet has a header row and quotes. Only the first column is read: an export of our own
 * device list carries the code and the MDM name too, and neither is a callsign.
 */
export function parseCallsignList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const rows = text.split(/\r?\n/);

  rows.forEach((row, index) => {
    const first = (row.split(/[,;\t]/)[0] ?? "").trim().replace(/^"|"$/g, "");
    if (!first) {
      return;
    }
    // A spreadsheet export names its columns; that name is not somebody's callsign
    if (index === 0 && /^call\s*sign$/i.test(first)) {
      return;
    }
    const key = first.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    out.push(first);
  });

  return out;
}
