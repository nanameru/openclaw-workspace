import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: "Photo to Life JP | 写真を動画に",
  description: "写真をアップロードして、AIで動きのあるショート動画を生成する日本向けサービス",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
};

export default RootLayout;
