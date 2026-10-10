import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEHAT | आसान स्वास्थ्य सहायता (Rural Health Triage)",
  description: "Rural healthcare triage support platform for Indian primary health centers and hospitals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
