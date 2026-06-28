import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小商家内容/销售数据 AI 分析助手",
  description: "面向小商家的内容、线索和销售数据工作台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">{children}</body>
    </html>
  );
}
