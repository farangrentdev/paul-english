import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavel English — частная школа английского",
  description:
    "Английский, который наконец-то заговорит. Частная школа Павла: дети и взрослые, онлайн по всему миру. Бесплатное пробное занятие.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
