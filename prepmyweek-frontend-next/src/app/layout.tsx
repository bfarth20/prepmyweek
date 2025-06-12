// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/context/AuthContext";
import { PrepProvider } from "../components/context/PrepContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepMyWeek",
  description: "Your weekly meal prep planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PrepProvider>{children}</PrepProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
