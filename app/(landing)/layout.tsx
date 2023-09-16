import Navbar from "@/components/Navbar";
import "../globals.css";
import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Providers } from "@/redux/provider";

const kanit_bold = Kanit({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-kanit-bold",
});

export const metadata: Metadata = {
  title: "ZKWallet",
  description: "trusted non custodial wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${kanit_bold.variable}`}>
      <Providers>
        <body>
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
