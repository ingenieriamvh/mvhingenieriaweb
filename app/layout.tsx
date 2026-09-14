import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ingeniería MVH | Ingeniería en iluminación",
  description:
    "MVH estudia, evalúa, diseña, acompaña y verifica iluminación.",
  icons: {
    icon: "/assets/logo-mvh.png",
    shortcut: "/assets/logo-mvh.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
