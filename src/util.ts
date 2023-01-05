/**
 * Strip accented characters from a string and replace them with their
 * non-accented counterparts.
 */
export function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function isUndefined(v: unknown): v is undefined {
  return typeof v === "undefined";
}

const BASE_URL = "/receptek";

export function href(path: string): string {
  // FIXME looks awful, required because of ts-node
  return (BASE_URL + path).replaceAll("//", "/");
}
