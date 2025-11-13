import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "~/components/navbar";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Some Title",
  description: "Some description",
  icons: [{ rel: "icon", url: "/github.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={outfit.className}>
        <Toaster position="top-center" />
        <body className="flex max-h-screen w-full flex-col items-center bg-white dark:bg-[#1a1a1a] transition-colors">
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
