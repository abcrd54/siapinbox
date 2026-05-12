import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SiapInbox",
  description: "Internal inbox platform for random and custom addresses."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
