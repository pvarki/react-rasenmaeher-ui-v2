/**
 * Utility to conditionally join class names together.  Filters out
 * falsy values (e.g. undefined, null, false) and joins the rest
 * with spaces.  Similar to the `clsx` package.
 */
export function cn(
  ...classes: Array<string | false | undefined | null>
): string {
  return classes.filter(Boolean).join(" ");
}
