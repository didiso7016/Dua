import vinext from "vinext";
import { defineConfig } from "vite";

// Worker 設定（D1 / R2 binding、進入點）統一放在 wrangler.jsonc。
export default defineConfig(async () => {
  // 本機開發不連 Cloudflare：Request.cf 用本機假資料、不送遙測。
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Wrangler / Miniflare 的狀態都留在專案內的 .wrangler（已列入 .gitignore）。
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler 在外掛載入時就讀取上面的路徑，所以要在設定環境變數之後才 import。
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
      }),
    ],
  };
});
