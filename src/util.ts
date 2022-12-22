const accentMap = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ö: "o",
  ő: "o",
  ú: "u",
  ü: "u",
  ű: "u",
};

/**
 * Strip accented Hungarian characters from a string and replace them with their
 * non-accented counterparts.
 */
export function deaccent(s: string): string {
  const chars = s.split("");
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i] as string;
    if (c in accentMap) {
      const replacement = accentMap[c as keyof typeof accentMap];
      chars[i] = replacement;
    }
  }
  return chars.join("");
}

export function isUndefined(v: unknown): v is undefined {
  return typeof v === "undefined";
}

export function href(path: string): string {
  if ("env" in import.meta) {
    // FIXME looks awful, required because of ts-node
    const baseUrl = (import.meta["env" as keyof ImportMeta] as any).BASE_URL;
    return (baseUrl + path).replaceAll("//", "/");
  }
  return path;
}
