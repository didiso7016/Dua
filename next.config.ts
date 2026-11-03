import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 「關於我們」已併入刊登合作頁的公司介紹段落（#about）。
  async redirects() {
    return [{ source: "/about", destination: "/partner#about", permanent: true }];
  },
};

export default nextConfig;
