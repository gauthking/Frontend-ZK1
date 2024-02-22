import "../../../globals.css";
import { Kanit } from "next/font/google";
import { Providers } from "@/redux/provider";

const kanit_bold = Kanit({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-kanit-bold",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${kanit_bold.variable}`}>
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
