/** Simple className utility (no extra deps) */
export function clsx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(' ');
}
