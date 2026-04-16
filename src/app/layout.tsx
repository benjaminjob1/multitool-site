import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multitool | Benjamin Job",
  description: "Your essential tools - flashlight, spirit level, calculator, ruler",
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
