import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Корень воркспейса = папка этого конфига (в дереве выше есть лишний lockfile,
// и в пути есть пробел — фиксируем явно, чтобы Turbopack не путал корень).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
