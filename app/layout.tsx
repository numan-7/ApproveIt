import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google"
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "approve it",
  description: "Transform your workflow with intelligent approval management. Get instant visibility and control.",
  icons: "/logo.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className={`${playfair.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
