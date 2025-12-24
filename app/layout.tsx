import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalFooter } from "@/components/ui/conditional-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vector - Tender Management System",
  description: "AI-assisted Tender Intake and Proposal Submission System by Neural Arc Inc.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="flex flex-col h-full">
          <main className="flex-1">
            <Providers>{children}</Providers>
          </main>
          <ConditionalFooter />
        </div>
      </body>
    </html>
  );
}


