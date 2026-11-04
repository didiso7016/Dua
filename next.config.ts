import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 第 6 批：vinext 會把所有 multipart POST（包含 /api/admin/upload 圖片上傳）當成 server action 檢查大小，預設只有 1MB。
  // 調成與上傳 API 相同的 8MB（app/api/admin/upload 仍會檢查 8MB 與檔案格式）。
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // 「關於我們」已併入刊登合作頁的公司介紹段落（#about）。
  async redirects() {
    return [{ source: "/about", destination: "/partner#about", permanent: true }];
  },
};

export default nextConfig;
