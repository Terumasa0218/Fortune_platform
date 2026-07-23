import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Fortune Platform | 6つの占術で読み解く",
  description: "四柱推命、西洋占星術、紫微斗数、数秘術、九星気学、古典マヤ暦による総合鑑定。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
