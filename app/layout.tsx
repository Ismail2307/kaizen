import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Kaizen - Level Up Your Life",
  description: "A gamified personal growth and productivity platform",
}

const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem("kaizen-theme");
    if (theme === "light") {
      document.documentElement.classList.add("light");
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}