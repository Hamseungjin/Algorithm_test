import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polymarket True ROI Calculator",
  description:
    "Compute the real ROI of a Polymarket wallet by combining trades with on-chain USDC deposits and withdrawals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-textPrimary">
        {children}
      </body>
    </html>
  );
}
