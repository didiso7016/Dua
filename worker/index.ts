// Cloudflare Worker 進入點：把所有請求交給 vinext（App Router）處理。
import handler from "vinext/server/fetch-handler";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return handler.fetch(request, env, ctx);
  },
};
