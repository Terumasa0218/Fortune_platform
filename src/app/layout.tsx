import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortune Platform",
  description: "あなたの運勢を占うプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
