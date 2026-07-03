import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

/**
 * ÖNEMLİ GOTCHA: güvenlik modülleri "server-only" import ediyor — bu paket
 * Next.js derleme zamanı dışında hata fırlatır. Vitest'te zararsız bir
 * stub'a yönlendiriyoruz. rate-limit.ts ayrıca "next/headers" import ediyor;
 * getClientIp() testlerde çağrılmasa da modül import edilebilsin diye o da
 * stub'lanıyor.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "src/test/stubs/server-only.ts"),
      "next/headers": path.resolve(
        __dirname,
        "src/test/stubs/next-headers.ts",
      ),
    },
  },
  test: {
    environment: "node",
  },
});
