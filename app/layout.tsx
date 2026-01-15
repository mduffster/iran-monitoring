import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iran Situation Monitor",
  description: "Real-time monitoring dashboard for Iran - flights, news, social media, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
