import type { Metadata, Viewport } from "next";
import { Epilogue, Manrope } from "next/font/google";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Rezeptretter",
    default: "Rezeptretter – Rezepte retten, organisieren, nachkochen",
  },
  description:
    "Extrahiere Rezepte von jeder Webseite. Organisiere sie an einem Ort. Koch sie Schritt für Schritt nach.",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rezeptretter",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#974400",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${epilogue.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-background text-on-surface">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
