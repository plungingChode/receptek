/**
 * Strip accented characters from a string and replace them with their
 * non-accented counterparts.
 *
 * @param {string} s
 * @returns {string}
 */
export function deaccent(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * @param {unknown} v
 * @returns {v is undefined}
 */
export function isUndefined(v) {
  return typeof v === "undefined";
}

const BASE_URL = "/receptek";

/**
 * @param {string} path
 * @returns {string}
 */
export function href(path) {
  // FIXME looks awful, required because of ts-node
  return (BASE_URL + path).replaceAll("//", "/");
}
