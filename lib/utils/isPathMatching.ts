export function isPathMatching(path: string | null, href: string) {
  return path?.startsWith(href);
}
