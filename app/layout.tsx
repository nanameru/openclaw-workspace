import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動画リンク文字起こし | JP Transcript",
  description: "YouTube / X のURLから文字起こしを取得"
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
