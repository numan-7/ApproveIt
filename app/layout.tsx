import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google"
import "./globals.css";

const playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "approve it",
  description: "Transform your workflow with intelligent approval management. Get instant visibility and control.",
  icons: "/logo.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.className}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
