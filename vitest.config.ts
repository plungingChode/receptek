/// <reference types="vitest" />
import type { UserConfig } from "vite";
import { getViteConfig } from "astro/config";

const config: UserConfig = {};

// TypeScript doesn't recognize vitest's `UserConfig` extension,
// so we use `config` to define it, then cast it to any.
export default getViteConfig(config as any);
